import { Injectable } from '@nestjs/common';
import { CreateProductShopDto } from './dto/create-product-shop.dto';
import { UpdateProductShopDto } from './dto/update-product-shop.dto';

@Injectable()
export class ProductShopService {
  create(createProductShopDto: CreateProductShopDto) {
    return 'This action adds a new productShop';
  }

  findAll() {
    return `This action returns all productShop`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productShop`;
  }

  update(id: number, updateProductShopDto: UpdateProductShopDto) {
    return `This action updates a #${id} productShop`;
  }

  remove(id: number) {
    return `This action removes a #${id} productShop`;
  }
}
