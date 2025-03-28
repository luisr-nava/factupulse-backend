import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CurrentUserService } from '../current-user/current-user.service';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly currentUserService: CurrentUserService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user) {
      this.currentUserService.setUser(user);
    }

    return next.handle();
  }
}
