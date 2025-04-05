import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductCategory } from './entities/category.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from 'src/shop/entities/shop.entity';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { SocketEvent } from 'src/enums';
import { SocketGateway } from 'src/socket/socket.gateway';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    private readonly socketGateway: SocketGateway,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: User) {
    let shops: Shop[];

    const categoryTrim = createCategoryDto.name.trim();

    if (createCategoryDto.shopIds && createCategoryDto.shopIds.length > 0) {
      shops = await this.shopRepository.findBy({
        id: In(createCategoryDto.shopIds),
      });
    } else {
      shops = await this.shopRepository.findBy({ owner: { id: user.id } });
    }

    const creationChange: Record<string, { before: null; after: any }> = {
      name: { before: null, after: categoryTrim },
      shopIds: {
        before: null,
        after: shops.map((shop) => shop.id),
      },
    };

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: categoryTrim },
    });

    if (existingCategory) {
      throw new ConflictException(
        `La categoria con el nombre ${createCategoryDto.name} ya existe`,
      );
    }

    const category = this.categoryRepository.create({
      name: categoryTrim,
      createdBy: user,
      shops,
      modificationHistory: [
        {
          updatedBy: {
            id: user.id,
            name: user.name,
          },
          updatedAt: new Date().toISOString(),
          changes: creationChange,
        },
      ],
    });

    const savedCategory = await this.categoryRepository.save(category);

    this.socketGateway.emit(
      SocketEvent.CATEGORY_PRODUCT_CREATED,
      savedCategory,
    );
    
    return {
      id: savedCategory.id,
      name: savedCategory.name,
      shops: savedCategory.shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
      })),
      createdBy: {
        id: savedCategory.createdBy.id,
        name: savedCategory.createdBy.name,
      },
      modificationHistory: savedCategory.modificationHistory,
    };
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: FilterDto,
    user: User,
  ) {
    const { limit = 10, page = 0 } = paginationDto;
    const { search, dateFrom, dateTo } = filterDto;

    const userShops = await this.shopRepository.find({
      where: { owner: { id: user.id } },
      select: ['id'],
    });

    const shopIds = userShops.map((s) => s.id);

    const allCategories = await this.categoryRepository.find({
      relations: ['shops', 'createdBy'],
    });

    let filtered = allCategories.filter((cat) =>
      cat.shops.some((shop) => shopIds.includes(shop.id)),
    );

    if (search) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(term),
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (cat) => new Date(cat['createdAt']) >= new Date(dateFrom),
      );
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setDate(to.getDate() + 1);
      filtered = filtered.filter((cat) => new Date(cat['createdAt']) <= to);
    }
    const start = page * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      total: filtered.length,
      limit,
      page,
      data: paginated.map((cat) => ({
        id: cat.id,
        name: cat.name,
        shops: cat.shops.map((shop) => ({
          id: shop.id,
          name: shop.name,
        })),
        createdBy: {
          id: cat.createdBy.id,
          name: cat.createdBy.name,
        },
        modificationHistory: cat.modificationHistory,
      })),
    };
  }

  async findOne(id: string, user: User) {
    const userShops = await this.shopRepository.find({
      where: { owner: { id: user.id } },
      select: ['id'],
    });

    const shopIds = userShops.map((shop) => shop.id);

    const category = await this.categoryRepository.findOne({
      where: {
        id,
        shops: {
          id: In(shopIds),
        },
      },
      relations: ['shops', 'createdBy'],
    });

    if (!category) {
      throw new NotFoundException(`La categoría con ID ${id} no existe.`);
    }
    return {
      id: category.id,
      name: category.name,
      shops: category.shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
      })),
      createdBy: {
        id: category.createdBy.id,
        name: category.createdBy.name,
      },
      modificationHistory: category.modificationHistory,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: User) {
    const category = await this.findOne(id, user);

    const trimmedName = updateCategoryDto.name?.trim();

    let shops: Shop[] = await this.shopRepository.findBy({
      id: In(category.shops.map((shop) => shop.id)),
    });

    if (updateCategoryDto.shopIds && updateCategoryDto.shopIds.length > 0) {
      shops = await this.shopRepository.findBy({
        id: In(updateCategoryDto.shopIds),
      });
    } else {
      shops = await this.shopRepository.findBy({ owner: { id: user.id } });
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: trimmedName },
    });

    if (existingCategory && existingCategory.id !== id) {
      throw new ConflictException(
        `La categoria con el nombre ${updateCategoryDto.name} ya existe`,
      );
    }

    const changes: Record<string, any> = {};

    if (trimmedName && trimmedName !== category.name) {
      changes.name = {
        before: category.name,
        after: trimmedName,
      };
    }

    const oldShopIds = category.shops.map((s) => s.id).sort();

    const newShopIds = shops.map((s) => s.id).sort();

    if (JSON.stringify(oldShopIds) !== JSON.stringify(newShopIds)) {
      changes.shopIds = {
        before: oldShopIds,
        after: newShopIds,
      };
    }

    if (Object.keys(changes).length === 0) {
      return category;
    }
    category.name = trimmedName;
    category.shops = shops;

    category.modificationHistory.push({
      updatedBy: {
        id: user.id,
        name: user.name,
      },
      updatedAt: new Date().toString(),
      changes,
    });

    const updatedcategory = await this.categoryRepository.save(category);

    this.socketGateway.emit(
      SocketEvent.CATEGORY_PRODUCT_UPDATED,
      updatedcategory,
    );

    return {
      id: updatedcategory.id,
      name: updatedcategory.name,
      shops: updatedcategory.shops.map((s) => ({ id: s.id, name: s.name })),
      createdBy: {
        id: updatedcategory.createdBy.id,
        name: updatedcategory.createdBy.name,
      },
      modificationHistory: updatedcategory.modificationHistory,
    };
  }

  async remove(id: string, user: User) {
    await this.findOne(id, user);

    const deleteCategory = await this.categoryRepository.delete(id);

    this.socketGateway.emit(
      SocketEvent.CATEGORY_PRODUCT_DELETED,
      deleteCategory,
    );

    return {
      statusCode: 200,
      message: 'Categoría eliminada correctamente',
    };
  }
}
