import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductShopModule } from './product-shop/product-shop.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SocketModule } from 'src/socket/socket.module';
import { ShopModule } from 'src/shop/shop.module';
import { CategoryModule } from './category/category.module';
import { CommonModule } from 'src/common/common.module';
import { Product } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule,
    SocketModule,
    ShopModule,
    CategoryModule,
    CommonModule,
    ProductShopModule,
    forwardRef(() => CategoryModule), // ✅ necesario también acá
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
