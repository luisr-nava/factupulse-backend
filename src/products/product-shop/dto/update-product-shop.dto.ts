import { PartialType } from '@nestjs/mapped-types';
import { CreateProductShopDto } from './create-product-shop.dto';

export class UpdateProductShopDto extends PartialType(CreateProductShopDto) {}
