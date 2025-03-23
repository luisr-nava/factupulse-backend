import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCategory]),
    AuthModule,
    SocketModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, TypeOrmModule],
})
export class CategoryModule {}
