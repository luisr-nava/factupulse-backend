import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/enums';

export const META_ROLES = 'role';

export const RoleProtected = (...args: UserRole[]) => {
  return SetMetadata(META_ROLES, args);
};
