import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Injectable,
  Scope,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserRole } from 'src/enums';
import { Auth } from 'src/auth/decorators';
import { BaseController } from 'src/common/base/base.controller';
import { CurrentUserService } from 'src/common/current-user/current-user.service';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { RemoveProductDto } from './dto/remove-product.dto';

@Injectable({ scope: Scope.REQUEST })
@Auth(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
@Controller('products')
export class ProductsController extends BaseController {
  constructor(
    private readonly productsService: ProductsService,
    currentUser: CurrentUserService,
  ) {
    super(currentUser);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto, this.user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterDto,
  ) {
    return this.productsService.findAll(paginationDto, filterDto, this.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id, this.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto, this.user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RemoveProductDto,
  ) {
    return this.productsService.remove(id, body, this.user);
  }
}
