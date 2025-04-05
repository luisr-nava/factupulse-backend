import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailerModule } from 'src/mailer/mailer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { CommonModule } from 'src/common/common.module';
import { ShopModule } from 'src/shop/shop.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailerModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    CommonModule,
    ShopModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
