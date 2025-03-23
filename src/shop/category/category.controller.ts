import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { UserRole } from 'src/enums';
import { ShopService } from '../shop.service';
import { User } from 'src/auth/entities/user.entity';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { PaginationDto } from 'src/common/dtos/paginations.dto';

@Controller('shop-category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Auth(UserRole.OWNER)
  createCategory(
    @Body() createShopCategoryDto: CreateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoryService.create(createShopCategoryDto, user);
  }

  @Get()
  @Auth(UserRole.OWNER)
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterDto,
    @GetUser() user: User,
  ) {
    return this.categoryService.findAll(paginationDto, filterDto, user);
  }

  @Get(':id')
  @Auth(UserRole.OWNER)
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    console.log(1);
    return this.categoryService.findOne(id, user);
  }

  @Patch(':id')
  @Auth(UserRole.OWNER)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShopCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoryService.updateCategory(id, updateShopCategoryDto, user);
  }

  @Delete(':id')
  @Auth(UserRole.OWNER)
  deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.categoryService.deleteCategory(id, user);
  }
}
