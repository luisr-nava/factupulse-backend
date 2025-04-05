import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Date)
  dateFrom?: number;

  @IsOptional()
  @Type(() => Date)
  dateTo?: number;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsIn(['EMPLOYEE', 'MANAGER'])
  role?: 'EMPLOYEE' | 'MANAGER';
}
