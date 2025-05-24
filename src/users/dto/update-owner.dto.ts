import { PartialType } from '@nestjs/mapped-types';
import { CreateOwnerDto } from './create-owner.dto';
import { IsString } from 'class-validator';

export class UpdateOwnerDto extends PartialType(CreateOwnerDto) {
  @IsString()
  newPassword?: string;
}
