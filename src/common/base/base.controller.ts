import { CurrentUserService } from '../current-user/current-user.service';
import { User } from 'src/auth/entities/user.entity';

export abstract class BaseController {
  constructor(protected readonly currentUser: CurrentUserService) {}

  protected get user(): User {
    return this.currentUser.getUser();
  }
}
