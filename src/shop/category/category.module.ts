import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SocketModule } from 'src/socket/socket.module';
import { ShopCategories } from './entities/category.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopCategories]),
    AuthModule,
    SocketModule,
    CommonModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],

  exports: [CategoryService, TypeOrmModule],
})
export class CategoryModule {}
