import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/enums';
import { RoleProtected } from './role-protected.decorators';
import { UserRoleGuard } from '../guards/user-role.guard';
import { AuthGuard } from '@nestjs/passport';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
