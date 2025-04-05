import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Injectable,
  Scope,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UserRole } from 'src/enums';
import { Auth } from 'src/auth/decorators';
import { CurrentUserService } from 'src/common/current-user/current-user.service';
import { BaseController } from 'src/common/base/base.controller';

@Injectable({ scope: Scope.REQUEST })
@Auth(UserRole.OWNER, UserRole.MANAGER)
@Controller('employee')
export class EmployeeController extends BaseController {
  constructor(
    private readonly employeeService: EmployeeService,
    currentUser: CurrentUserService,
  ) {
    super(currentUser);
  }

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto, this.user);
  }

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
}
