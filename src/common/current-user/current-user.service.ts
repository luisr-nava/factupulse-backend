import { Injectable, Scope } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

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
