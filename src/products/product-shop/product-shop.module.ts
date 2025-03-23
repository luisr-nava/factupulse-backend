import { Module } from '@nestjs/common';
import { ProductShopService } from './product-shop.service';
import { ProductShopController } from './product-shop.controller';

@Module({
  controllers: [ProductShopController],
  providers: [ProductShopService],
})
export class ProductShopModule {}
