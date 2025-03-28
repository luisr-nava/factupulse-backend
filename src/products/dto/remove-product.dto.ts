import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class RemoveProductDto {
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  shopIds?: string[];

  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
