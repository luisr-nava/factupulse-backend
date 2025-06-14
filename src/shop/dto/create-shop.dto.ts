import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ShopCategory } from 'src/enums';

export class CreateShopDto {
  @IsString({ message: 'El nombre de la tienda es obligatoria' })
  name: string;

  @IsString({ message: 'La direccion de la tienda es obligatoria' })
  address: string;

  @IsString({ message: 'El pais de la tienda es obligatoria' })
  country: string;

  @IsString({ message: 'La categoría de la tienda es obligatoria' })
  @IsNotEmpty({ message: 'La categoría de la tienda no puede ir vacía' })
  category: string;
}
