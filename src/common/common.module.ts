import { Module, Scope } from '@nestjs/common';
import { CurrentUserService } from './current-user/current-user.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';

@Module({
  providers: [CurrentUserService, CurrentUserInterceptor],
  exports: [CurrentUserService],
})
export class CommonModule {}
