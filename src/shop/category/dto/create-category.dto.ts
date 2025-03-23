import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'El nombre de la categoria es obligatoria' })
  @IsNotEmpty({ message: 'El nombre de la categoria no puede ir vacia' })
  name: string;
}
