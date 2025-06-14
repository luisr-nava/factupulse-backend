import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { EmployeeModule } from './employee/employee.module';
import { ShopModule } from './shop/shop.module';
import { SocketGateway } from './socket/socket.gateway';
import { SocketModule } from './socket/socket.module';
import { ProductsModule } from './products/products.module';
import { CurrentUserService } from './common/current-user/current-user.service';
import { CurrentUserInterceptor } from './common/interceptors/current-user.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from './mailer/mailer.module';
import { UploadImageModule } from './upload-image/upload-image.module';
import { CategorySeeder } from './database/seeders/category.seeder';
import { SalesModule } from './sales/sales.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    CacheModule.register({
      store: redisStore as any,
      url: process.env.REDIS_URL,
      ttl: 60, // segundos
      isGlobal: true,
    }),
    AuthModule,
    EmployeeModule,
    UsersModule,
    ShopModule,
    SocketModule,
    ProductsModule,
    CommonModule,
    UsersModule,
    MailerModule,
    UploadImageModule,
    SalesModule,
  ],
  providers: [
    CategorySeeder,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  exports: [],
})
export class AppModule {}
