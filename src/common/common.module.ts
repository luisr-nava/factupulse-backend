import { Module, Scope } from '@nestjs/common';
import { CurrentUserService } from './current-user/current-user.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { RedisService } from './redis/redis.service';

@Module({
  providers: [CurrentUserService, CurrentUserInterceptor, RedisService],
  exports: [CurrentUserService, RedisService],
})
export class CommonModule {}
