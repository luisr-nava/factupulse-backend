import { Module } from '@nestjs/common';
import { ProductShopService } from './product-shop.service';
import { ProductShopController } from './product-shop.controller';
import { ProductShop } from './entities/product-shop.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProductShop])],
  controllers: [ProductShopController],
  providers: [ProductShopService],
  exports: [ProductShopService, TypeOrmModule],
})
export class ProductShopModule {}
