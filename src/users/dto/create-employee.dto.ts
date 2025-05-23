import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRole } from 'src/enums';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20)
  @IsOptional()
  password?: string;

  @IsEnum(UserRole)
  role: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  shopIds: string[];

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  hireDate: string;

  @IsNumber()
  @IsOptional()
  salary: number;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;
}
