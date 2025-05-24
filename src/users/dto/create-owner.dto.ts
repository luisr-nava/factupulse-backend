import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOwnerDto {
  @IsString({ message: 'El email debe ser un texto válido' })
  @IsEmail({}, { message: 'Por favor, ingrese un correo electrónico válido' })
  email: string;

  @IsString({
    message: '',
  })
  name: string;

  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  @MaxLength(50, {
    message: 'La contraseña debe tener menos de 50 caracteres',
  })
  
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una letra mayúscula, minúscula y un número',
  })
  password: string;
}
