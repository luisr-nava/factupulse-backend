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
  Scope,
  Injectable,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { UserRole } from 'src/enums';
import { ShopService } from '../shop.service';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { CurrentUserService } from 'src/common/current-user/current-user.service';
import { BaseController } from 'src/common/base/base.controller';

@Controller('shop-category')
@Injectable({ scope: Scope.REQUEST })
@Auth(UserRole.OWNER)
export class CategoryController extends BaseController {
  constructor(
    private readonly categoryService: CategoryService,
    currentUser: CurrentUserService,
  ) {
    super(currentUser);
  }

  @Post()
  createCategory(@Body() createShopCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createShopCategoryDto, this.user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterDto,
  ) {
    return this.categoryService.findAll(paginationDto, filterDto, this.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id, this.user);
  }

  @Patch(':id')
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShopCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(
      id,
      updateShopCategoryDto,
      this.user,
    );
  }

  @Delete(':id')
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.deleteCategory(id, this.user);
  }
}
