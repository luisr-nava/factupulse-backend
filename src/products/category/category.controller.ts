import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Scope,
  Injectable,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { UserRole } from 'src/enums';
import { CurrentUserService } from 'src/common/current-user/current-user.service';
import { BaseController } from 'src/common/base/base.controller';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { PaginationDto } from 'src/common/dtos/paginations.dto';

@Controller('product-category')
@Injectable({ scope: Scope.REQUEST })
@Auth(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
export class CategoryController extends BaseController {
  constructor(
    private readonly categoryService: CategoryService,
    currentUser: CurrentUserService,
  ) {
    super(currentUser);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto, this.user);
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto, this.user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id, this.user);
  }
}
