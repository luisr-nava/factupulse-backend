import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  Scope,
  Injectable,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Auth } from 'src/auth/decorators';
import { UserRole } from 'src/enums';
import { CurrentUserService } from 'src/common/current-user/current-user.service';
import { BaseController } from 'src/common/base/base.controller';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { FilterDto } from 'src/common/dtos/filters.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
@Injectable({ scope: Scope.REQUEST })
@Controller('users')
export class UsersController extends BaseController {
  constructor(
    private readonly usersService: UsersService,
    currentUser: CurrentUserService,
  ) {
    super(currentUser);
  }

  @Post('register-owner')
  registerOwner(@Body() createOwnerDto: CreateOwnerDto) {
    return this.usersService.createOwner(createOwnerDto);
  }

  @Put('owner/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    return this.usersService.updateOwner(id, updateOwnerDto);
  }

  @Auth(UserRole.OWNER, UserRole.MANAGER)
  @Post('register-employee')
  registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.usersService.createEmployee(createEmployeeDto, this.user);
  }

  @Auth(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @Put('employee/:id')
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.usersService.updateEmployee(id, updateEmployeeDto, this.user);
  }

  @Auth(UserRole.OWNER, UserRole.MANAGER)
  @Get('employees')
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterDto,
  ) {
    return this.usersService.findAllEmploye(
      paginationDto,
      filterDto,
      this.user,
    );
  }

  @Auth(UserRole.OWNER, UserRole.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneEmployee(id, this.user);
  }
  
  @Auth(UserRole.OWNER, UserRole.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id, this.user);
  }
}
