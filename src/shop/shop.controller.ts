import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Auth, GetRawHeaders, GetUser } from 'src/auth/decorators';
import { UserRole } from 'src/enums';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { FilterDto } from 'src/common/dtos/filters.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @Auth(UserRole.OWNER)
  create(@Body() createShopDto: CreateShopDto, @GetUser() user: User) {
    return this.shopService.create(createShopDto, user);
  }

  @Get()
  @Auth(UserRole.OWNER)
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterDto,
    @GetUser() user: User,
  ) {
    return this.shopService.findAll(paginationDto, filterDto, user);
  }

  @Get(':id')
  @Auth(UserRole.OWNER)
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.shopService.findOne(id, user);
  }

  @Patch(':id')
  @Auth(UserRole.OWNER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShopDto: UpdateShopDto,
    @GetUser() user: User,
  ) {
    return this.shopService.update(id, updateShopDto, user);
  }

  @Delete(':id')
  @Auth(UserRole.OWNER)
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.shopService.remove(id, user);
  }
}
