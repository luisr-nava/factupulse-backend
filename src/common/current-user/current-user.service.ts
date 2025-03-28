import { Injectable, Scope } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserService {
  private user: User;

  setUser(user: User) {
    this.user = user;
  }

  getUser(): User {
    return this.user;
  }
}
