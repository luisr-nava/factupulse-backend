import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductShopService } from './product-shop.service';
import { CreateProductShopDto } from './dto/create-product-shop.dto';
import { UpdateProductShopDto } from './dto/update-product-shop.dto';

@Controller('product-shop')
export class ProductShopController {
  constructor(private readonly productShopService: ProductShopService) {}

  @Post()
  create(@Body() createProductShopDto: CreateProductShopDto) {
    return this.productShopService.create(createProductShopDto);
  }

  @Get()
  findAll() {
    return this.productShopService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productShopService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductShopDto: UpdateProductShopDto) {
    return this.productShopService.update(+id, updateProductShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productShopService.remove(+id);
  }
}
