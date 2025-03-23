import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoryModule } from './category/category.module';
import { ProductShopModule } from './product-shop/product-shop.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [CategoryModule, ProductShopModule],
})
export class ProductsModule {}
