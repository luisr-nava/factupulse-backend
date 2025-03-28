import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

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
}
