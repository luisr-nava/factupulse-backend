import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Shop } from './entities/shop.entity';
import { ShopCategories } from './category/entities/category.entity';
import { ShopCategory } from 'src/enums';
import { PaginationDto } from '../common/dtos/paginations.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { FilterDto } from '../common/dtos/filters.dto';
import { buildDateRangeFilter } from 'src/utils/date-filters';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(ShopCategories)
    private readonly shopCategoryRepository: Repository<ShopCategories>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(createShopDto: CreateShopDto, user: User) {
    const { name, address, country, category } = createShopDto;
    const trimmedName = name.trim(); 

    let enumCategory: ShopCategory | null = null;
    let customCategory: ShopCategories | null = null;

    if (Object.values(ShopCategory).includes(category as ShopCategory)) {
      enumCategory = category as ShopCategory;
    } else {
      customCategory = await this.shopCategoryRepository.findOne({
        where: { name: category, owner: { id: user.id } },
      });

      if (!customCategory) {
        throw new NotFoundException(
          `La categoría ${category} no existe. Crea la categoría antes de usarla.`,
        );
      }
    }
    const shopName = await this.shopRepository.findOne({
      where: { name: trimmedName, owner: { id: user.id } },
    });

    if (shopName) {
      throw new BadRequestException(
        `La tienda ${name} ya existe. Por favor, elige otro nombre.`,
      );
    }

    const shop = this.shopRepository.create({
      name: trimmedName,
      address,
      country,
      enumCategory,
      customCategory,
      owner: user,
    });

    const createShop = await this.shopRepository.save(shop);

    this.socketGateway.emitShopCreated(createShop);

    return createShop;
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: FilterDto,
    user: User,
  ) {
    const { limit = 10, page = 0 } = paginationDto;
    const { search, dateFrom, dateTo } = filterDto;

    const where: FindOptionsWhere<Shop> = { owner: { id: user.id } };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const dateFilter = buildDateRangeFilter(dateFrom, dateTo);
    if (dateFilter) {
      where.createdAt = dateFilter;
    }

    const [shops, total] = await this.shopRepository.findAndCount({
      take: limit,
      skip: page,
      where,
    });

    return {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(page / limit) + 1,
      data: shops,
    };
  }

  async findOne(id: string, user: User) {
    const shop = await this.shopRepository.findOne({
      where: { id, owner: { id: user.id } },
      relations: ['owner'],
    });

    if (!shop) {
      throw new NotFoundException(`La tienda con ID ${id} no existe.`);
    }

    if (shop.owner.id !== user.id) {
      throw new ForbiddenException(
        `No tienes permisos para acceder a esta tienda.`,
      );
    }

    return shop;
  }

  async update(id: string, updateShopDto: UpdateShopDto, user: User) {
    const shop = await this.findOne(id, user);
    const trimmedName = updateShopDto.name?.trim();

    if (trimmedName && trimmedName !== shop.name) {
      const existingShop = await this.shopRepository.findOne({
        where: { name: trimmedName, owner: { id: user.id } },
      });

      if (existingShop) {
        throw new ConflictException(
          `Ya tienes una tienda con el nombre ${trimmedName}.`,
        );
      }
    }

    Object.assign(shop, updateShopDto);

    if (updateShopDto.category) {
      let enumCategory: ShopCategory | null = null;
      let customCategory: ShopCategories | null = null;

      if (
        Object.values(ShopCategory).includes(
          updateShopDto.category as ShopCategory,
        )
      ) {
        enumCategory = updateShopDto.category as ShopCategory;
        shop.enumCategory = enumCategory;
        shop.customCategory = null;
      } else {
        customCategory = await this.shopCategoryRepository.findOne({
          where: { name: updateShopDto.category, owner: { id: user.id } },
        });

        if (!customCategory) {
          throw new NotFoundException(
            `La categoría ${updateShopDto.category} no existe. Crea la categoría antes de usarla.`,
          );
        }

        shop.customCategory = customCategory;
        shop.enumCategory = null;
      }
    }
    const updatedShop = await this.shopRepository.save(shop);

    this.socketGateway.emitShopUpdated(updatedShop);

    return updatedShop;
  }

  async remove(id: string, user: User) {
    const shop = await this.findOne(id, user);

    const deletedShop = await this.shopRepository.remove(shop);

    this.socketGateway.emitShopDeleted(deletedShop);

    return deletedShop;
  }
}
