import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Shop } from './entities/shop.entity';
import { SocketModule } from 'src/socket/socket.module';
import { CategoryModule } from './category/category.module';
import { ShopCategories } from './category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop]),
    AuthModule,
    SocketModule,
    CategoryModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService, TypeOrmModule],
})
export class ShopModule {}
