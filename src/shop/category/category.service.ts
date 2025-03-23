import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopCategories } from './entities/category.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { SocketGateway } from 'src/socket/socket.gateway';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { buildDateRangeFilter } from 'src/utils/date-filters';

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

    this.socketGateway.emitCategoryCreated(createCategory);

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
    const { limit = 10, page = 0 } = paginationDto;
    const { search, dateFrom, dateTo } = filterDto;

    const where: FindOptionsWhere<ShopCategories> = { owner: { id: user.id } };
    const createdAtFilter = buildDateRangeFilter(dateFrom, dateTo);
    if (createdAtFilter) {
      where.createdAt = createdAtFilter;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [customCategories, totalCustom] =
      await this.shopCategoryRepository.findAndCount({
        take: limit,
        skip: page,
        where,
      });

    const shouldFilterByDate = !!dateFrom || !!dateTo;

    const defaultCategories = shouldFilterByDate
      ? []
      : Object.values(ShopCategories)
          .filter((value) =>
            search ? value.toLowerCase().includes(search.toLowerCase()) : true,
          )
          .map((value) => ({
            name: value,
            isDefault: true,
          }));

    const formattedCustom = customCategories.map((cat) => ({
      ...cat,
      isDefault: false,
    }));

    const allCategories = [...defaultCategories, ...formattedCustom];

    return {
      total: allCategories.length,
      limit,
      page,
      totalPages: Math.ceil(allCategories.length / limit),
      currentPage: Math.floor(page / limit) + 1,
      data: allCategories.slice(page, page + limit),
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

    this.socketGateway.emitCategoryUpdated(updatedCategory);

    return updatedCategory;
  }

  async deleteCategory(id: string, user: User) {
    const category = await this.findOne(id, user);

    const deleteCategory = await this.shopCategoryRepository.remove(category);

    this.socketGateway.emitCategoryDeleted(deleteCategory);

    return deleteCategory;
  }
}
