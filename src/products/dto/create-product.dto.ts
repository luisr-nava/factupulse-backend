import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ShopProductData {
  @IsOptional()
  shopId: string;

  @IsString()
  @IsNotEmpty({ message: 'El stock del producto es obligatorio' })
  stock: number;

  @IsString()
  @IsNotEmpty({ message: 'El precio del producto es obligatorio' })
  price: number;

  @IsOptional()
  isAvailable: boolean;

  @IsOptional()
  sku: string;

  @IsOptional()
  minStock?: number;

  @IsOptional()
  discount: number;

  @IsOptional()
  availabilityReason?: 'manual' | 'stock_zero' | 'system' | 'deleted';
}
export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripcion es obligatoria' })
  description: string;

  @IsNotEmpty({ message: 'El costo es obligatorio' })
  cost: number;

  @IsArray()
  @IsNotEmpty({ message: 'Las categorias son obligatorias' })
  categories: string[];

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  barcode: string;

  @ValidateNested({ each: true })
  @Type(() => ShopProductData)
  shops: ShopProductData[];
}
