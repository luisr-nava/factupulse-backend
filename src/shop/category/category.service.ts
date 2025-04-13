import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopCategories } from './entities/category.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { SocketGateway } from 'src/socket/socket.gateway';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { buildDateRangeFilter } from 'src/utils/date-filters';
import { SocketEvent } from '../../enums/socket-event.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(ShopCategories)
    private readonly shopCategoryRepository: Repository<ShopCategories>,
    private readonly socketGateway: SocketGateway,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, user: User) {
    const categoryNameTrim = createCategoryDto.name.trim();
    const existingCategory = await this.shopCategoryRepository.findOne({
      where: { name: categoryNameTrim, owner: user },
    });

    if (existingCategory) {
      throw new ConflictException('La categoría ya existe para este usuario');
    }

    const category = this.shopCategoryRepository.create({
      ...createCategoryDto,
      name: categoryNameTrim,
      owner: user,
    });
    const createCategory = await this.shopCategoryRepository.save(category);

    this.socketGateway.emit(SocketEvent.CATEGORY_CREATED, createCategory);

    return createCategory;
  }

  async findOne(id: string, user: User) {
    const category = await this.shopCategoryRepository.findOne({
      where: { id, owner: { id: user.id } },
    });

    if (!category) {
      throw new NotFoundException(`La categoría con ID ${id} no existe.`);
    }

    return category;
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: FilterDto,
    user: User,
  ) {
    const { limit = 100, page = 0 } = paginationDto;
    const { search, dateFrom, dateTo } = filterDto;

    const query = this.shopCategoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.owner', 'owner')
      .where('owner.id = :userId', { userId: user.id })
      .orWhere('category.owner IS NULL');

    if (search) {
      query.andWhere('category.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (dateFrom) {
      query.andWhere(
        '(category.createdAt >= :dateFrom OR category.owner IS NULL)',
        {
          dateFrom,
        },
      );
    }

    if (dateTo) {
      query.andWhere(
        '(category.createdAt <= :dateTo OR category.owner IS NULL)',
        {
          dateTo,
        },
      );
    }

    const [categories, total] = await query
      .take(limit)
      .skip(page)
      .orderBy('category.name', 'ASC')
      .getManyAndCount();

    const data = categories.map((cat) => ({
      ...cat,
      isDefault: !cat.owner,
    }));

    return {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(page / limit) + 1,
      data,
    };
  }

  async updateCategory(
    id: string,
    updateShopCategoryDto: UpdateCategoryDto,
    user: User,
  ) {
    const category = await this.findOne(id, user);

    const trimmedName = updateShopCategoryDto.name?.trim();

    if (trimmedName && trimmedName !== category.name) {
      const existingCategory = await this.shopCategoryRepository.findOne({
        where: { name: trimmedName, owner: { id: user.id } },
      });
      if (existingCategory) {
        throw new ConflictException(`La categoría ${trimmedName} ya existe.`);
      }
    }

    Object.assign(category, {
      ...updateShopCategoryDto,
      name: trimmedName,
      owner: user,
    });

    const updatedCategory = await this.shopCategoryRepository.save(category);

    this.socketGateway.emit(SocketEvent.CATEGORY_UPDATED, updatedCategory);

    return updatedCategory;
  }

  async deleteCategory(id: string, user: User) {
    const category = await this.findOne(id, user);

    const deleteCategory = await this.shopCategoryRepository.remove(category);

    this.socketGateway.emit(SocketEvent.CATEGORY_DELETED, deleteCategory);

    return deleteCategory;
  }
}
