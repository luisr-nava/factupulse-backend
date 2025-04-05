import { User } from 'src/users/entities/user.entity';
import { CurrentUserService } from '../current-user/current-user.service';

export abstract class BaseController {
  constructor(protected readonly currentUser: CurrentUserService) {}

  protected get user(): User {
    return this.currentUser.getUser();
  }
}
