import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/paginations.dto';
import { FilterDto } from '../common/dtos/filters.dto';
import { ProductShop } from './product-shop/entities/product-shop.entity';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from './category/entities/category.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { Product } from './entities/product.entity';
import { buildDateRangeFilter } from 'src/utils/date-filters';
import { SocketGateway } from 'src/socket/socket.gateway';
import { SocketEvent } from 'src/enums';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductShop)
    private readonly productShopRepository: Repository<ProductShop>,

    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    private readonly socketGateway: SocketGateway,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const { name, description, cost, categories, shops } = createProductDto;
    const userShops = await this.shopRepository.find({
      where: { owner: { id: user.id } },
      select: ['id'],
    });

    const now = new Date();
    now.setHours(now.getHours() - 3);

    const userShopIds = userShops.map((s) => s.id);

    const categoryEntities = await this.categoryRepository.find({
      where: {
        id: In(categories),
      },
      relations: ['shops'],
    });

    const filteredCategories = categoryEntities.filter((cat) =>
      cat.shops.some((shop) => userShopIds.includes(shop.id)),
    );

    if (filteredCategories.length !== categories.length) {
      throw new NotFoundException(
        'Una o más categorías no pertenecen a tus tiendas.',
      );
    }

    const product = this.productRepository.create({
      name: name.trim(),
      description,
      cost,
      categories: categoryEntities,
      createdBy: user,
      createdAt: now,
    });

    const savedProduct = await this.productRepository.save(product);

    let productShopEntities = [];

    if (Array.isArray(shops) && shops.length > 0) {
      const firstShop = shops[0];

      const isGlobalAssignment = shops.length === 1 && !firstShop.shopId;

      if (isGlobalAssignment) {
        const userShops = await this.shopRepository.findBy({
          owner: { id: user.id },
        });

        if (userShops.length === 0) {
          throw new NotFoundException(
            `No se encontraron tiendas para el usuario ${user.name}`,
          );
        }

        productShopEntities = userShops.map((shop) => {
          const baseData = {
            stock: Number(firstShop.stock) ?? 0,
            price: Number(firstShop.price) ?? 0,
            sku: firstShop.sku || `${savedProduct.name}-${shop.name}`,
            discount: firstShop.discount ?? 0,
            minStock: firstShop.minStock ?? 0,
            isAvailable: firstShop.isAvailable ?? true,
          };

          return this.productShopRepository.create({
            product: savedProduct,
            shop,
            ...baseData,
            modificationHistory: [
              {
                updatedBy: { id: user.id, name: user.name },
                updatedAt: new Date().toISOString(),
                shopId: shop.id,
                changes: Object.fromEntries(
                  Object.entries(baseData).map(([key, value]) => [
                    key,
                    { before: null, after: value },
                  ]),
                ),
              },
            ],
          });
        });
      } else {
        productShopEntities = await Promise.all(
          shops.map(async (data) => {
            if (!data.shopId) {
              throw new BadRequestException(
                'shopId no puede estar vacío si se asigna individualmente',
              );
            }

            const shop = await this.shopRepository.findOneBy({
              id: data.shopId,
            });
            if (!shop)
              throw new NotFoundException(
                `La tienda con ID ${data.shopId} no existe`,
              );

            return this.productShopRepository.create({
              product: savedProduct,
              shop,
              stock: +data.stock,
              price: +data.price,
              sku: data.sku || `${savedProduct.name}-${shop.name}`,
              discount: data.discount ?? 0,
              minStock: data.minStock ?? 0,
              isAvailable: data.isAvailable ?? true,
              modificationHistory: [
                {
                  updatedBy: { id: user.id, name: user.name },
                  updatedAt: new Date().toISOString(),
                  shopId: shop.id,
                  changes: {
                    stock: { before: null, after: +data.stock },
                    price: { before: null, after: +data.price },
                    sku: {
                      before: null,
                      after: data.sku || `${savedProduct.name}-${shop.name}`,
                    },
                    discount: { before: null, after: data.discount ?? 0 },
                    minStock: { before: null, after: data.minStock ?? 0 },
                    isAvailable: {
                      before: null,
                      after: data.isAvailable ?? true,
                    },
                  },
                },
              ],
            });
          }),
        );
      }
    }

    const createProduct =
      await this.productShopRepository.save(productShopEntities);

    this.socketGateway.emit(SocketEvent.PRODUCT_CREATED, createProduct);

    return {
      mesage: 'Producto creado exitosamente',
      productId: savedProduct.id,
      assignedToShops: productShopEntities.map((ps) => ({
        shopId: ps.shop.id,
        shopName: ps.shop.name,
        stock: ps.stock,
        price: ps.price,
        sku: ps.sku,
        discount: ps.discount,
        minStock: ps.minStock,
        isAvailable: ps.isAvailable,
      })),
    };
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: FilterDto,
    user: User,
  ) {
    const { limit = 10, page = 0 } = paginationDto;
    const { shopId, search, dateFrom, dateTo } = filterDto;

    let shopIds: string[] = [];

    if (shopId) {
      const shop = await this.shopRepository.findOne({
        where: { id: shopId, owner: { id: user.id } },
      });

      if (!shop) {
        throw new NotFoundException(`La tienda con ID ${shopId} no existe`);
      }

      shopIds = [shop.id];
    } else {
      const userShops = await this.shopRepository.find({
        where: { owner: { id: user.id } },
        select: ['id'],
      });

      shopIds = userShops.map((s) => s.id);
    }

    const createdAtFilter = buildDateRangeFilter(dateFrom, dateTo);

    const where: FindOptionsWhere<ProductShop>[] = shopIds.map((id) => ({
      shop: { id },
      ...(createdAtFilter && { product: { createdAt: createdAtFilter } }),
      ...(search && { product: { name: ILike(`%${search}%`) } }),
    }));

    const skip = (page - 1) * limit;

    const [productShops, total] = await this.productShopRepository.findAndCount(
      {
        skip,
        take: limit,
        relations: ['product', 'shop'],
        where,
      },
    );

    return {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(page / limit) + 1,
      data: productShops.map((ps) => ({
        productId: ps.product.id,
        name: ps.product.name,
        description: ps.product.description,
        cost: ps.product.cost,
        createdAt: ps.product.createdAt,
        shop: {
          id: ps.shop.id,
          name: ps.shop.name,
        },
        stock: ps.stock,
        price: ps.price,
        sku: ps.sku,
        discount: ps.discount,
        minStock: ps.minStock,
        isAvailable: ps.isAvailable,
        modificationHistory: ps.modificationHistory ?? [],
        category: ps.product.categories[0].name,
      })),
    };
  }

  async findOne(ProductId: string, user: User) {
    const userShops = await this.shopRepository.find({
      where: { owner: { id: user.id } },
      select: ['id'],
    });

    const shopIds = userShops.map((s) => s.id);

    const productShop = await this.productShopRepository.find({
      where: {
        product: { id: ProductId },
        shop: { id: In(shopIds) },
      },
      relations: ['product', 'shop'],
    });

    if (!productShop) {
      throw new NotFoundException(`El producto con ID ${ProductId} no existe`);
    }

    const product = productShop[0].product;

    return {
      productId: product.id,
      name: product.name,
      description: product.description,
      cost: product.cost,
      createdAt: product.createdAt,
      assignedShops: productShop.map((ps) => ({
        shopId: ps.shop.id,
        shopName: ps.shop.name,
        stock: ps.stock,
        price: ps.price,
        sku: ps.sku,
        discount: ps.discount,
        minStock: ps.minStock,
        isAvailable: ps.isAvailable,
        modificationHistory: ps.modificationHistory ?? [],
      })),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const productShops = await this.productShopRepository.find({
      where: {
        product: { id },
        shop: { owner: { id: user.id } },
      },
      relations: ['product', 'shop'],
    });

    if (!productShops || productShops.length === 0) {
      throw new NotFoundException(
        `No tienes permiso para modificar este producto`,
      );
    }

    const product = productShops[0].product;

    // Actualizar categorías
    let updateCategories = product.categories;

    if (updateProductDto.categories) {
      const userShops = await this.shopRepository.find({
        where: { owner: { id: user.id } },
        select: ['id'],
      });

      const userShopsIds = userShops.map((s) => s.id);

      const foundCategories = await this.categoryRepository.find({
        where: { id: In(updateProductDto.categories) },
        relations: ['shops'],
      });

      const validateCategories = foundCategories.filter((cat) =>
        cat.shops.some((shop) => userShopsIds.includes(shop.id)),
      );

      if (validateCategories.length !== updateProductDto.categories.length) {
        throw new NotFoundException(
          'Una o más categorías no pertenecen a tus tiendas.',
        );
      }

      updateCategories = validateCategories;
    }

    if (updateProductDto.name) product.name = updateProductDto.name.trim();
    if (updateProductDto.description)
      product.description = updateProductDto.description;
    if (updateProductDto.cost !== undefined)
      product.cost = updateProductDto.cost;

    product.categories = updateCategories;
    await this.productRepository.save(product);

    // Actualizar por tienda
    const updateShops = updateProductDto.shops;

    if (Array.isArray(updateShops)) {
      for (const shopData of updateShops) {
        // Si no viene shopId, aplicar a todas las tiendas
        const targetShops = shopData.shopId
          ? productShops.filter((p) => p.shop.id === shopData.shopId)
          : productShops;

        for (const ps of targetShops) {
          const changes: Partial<Record<ProductShopField, FieldChange<any>>> =
            {};

          const updateField = <K extends ProductShopField>(
            field: K,
            value: ProductShop[K],
          ) => {
            if (ps[field] !== value) {
              changes[field] = {
                before: ps[field] as ProductShopFieldTypes[K] | null,
                after: value as ProductShopFieldTypes[K],
              };
              ps[field] = value;
            }
          };

          updateField('stock', Number(shopData.stock));
          updateField('price', Number(shopData.price));
          updateField('sku', shopData.sku || `${product.name}-${ps.shop.name}`);
          updateField('discount', Number(shopData.discount ?? 0));
          updateField('minStock', Number(shopData.minStock ?? 0));
          updateField('isAvailable', shopData.isAvailable ?? true);
          if (
            ps.isAvailable === false &&
            shopData.availabilityReason &&
            ps.availabilityReason !== shopData.availabilityReason
          ) {
            updateField('availabilityReason', shopData.availabilityReason);
          }

          if (Object.keys(changes).length > 0) {
            ps.modificationHistory = [
              ...(ps.modificationHistory || []),
              {
                updatedAt: new Date().toISOString(),
                updatedBy: {
                  id: user.id,
                  name: user.name,
                },
                shopId: ps.shop.id,
                changes,
              },
            ];
            const updateProduct = await this.productShopRepository.save(ps);

            this.socketGateway.emit(SocketEvent.PRODUCT_UPDATED, updateProduct);
          }
        }
      }
    }

    return {
      message: 'Producto actualizado correctamente',
      productId: product.id,
      updatedShops: productShops.map((ps) => ({
        shopId: ps.shop.id,
        shopName: ps.shop.name,
        stock: ps.stock,
        price: ps.price,
        sku: ps.sku,
        discount: ps.discount,
        minStock: ps.minStock,
        isAvailable: ps.isAvailable,
        modificationHistory: ps.modificationHistory?.slice(-1)[0], // último cambio
      })),
    };
  }

  async remove(
    productId: string,
    body: { shopIds?: string[]; force?: boolean },
    user: User,
  ) {
    const { shopIds = [], force = false } = body;

    const productShops = await this.productShopRepository.find({
      where: {
        product: { id: productId },
        shop:
          shopIds.length > 0
            ? {
                id: In(shopIds),
                owner: { id: user.id },
              }
            : { owner: { id: user.id } },
      },
      relations: ['shop', 'product'],
    });
    if (productShops.length === 0) {
      throw new NotFoundException(
        `No tienes permiso para eliminar este producto`,
      );
    }
    for (const ps of productShops) {
      if (force) {
        const deleteProduct = await this.productShopRepository.remove(ps);

        this.socketGateway.emit(SocketEvent.PRODUCT_DELETED, deleteProduct);
      } else {
        ps.isAvailable = false;
        ps.availabilityReason = 'deleted';
        const deleteProduct = await this.productShopRepository.save(ps);
        this.socketGateway.emit(SocketEvent.PRODUCT_DELETED, deleteProduct);
      }
    }
    return {
      message: force
        ? 'Producto eliminado permanentemente de las tiendas seleccionadas'
        : 'Producto deshabilitado',
      affectedShops: productShops.map((ps) => ({
        shopId: ps.shop.id,
        shopName: ps.shop.name,
      })),
    };
  }
}
