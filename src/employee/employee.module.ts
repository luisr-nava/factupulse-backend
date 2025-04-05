import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SocketModule } from 'src/socket/socket.module';
import { CommonModule } from 'src/common/common.module';
import { ShopModule } from 'src/shop/shop.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    AuthModule,
    ShopModule,
    SocketModule,
    CommonModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
