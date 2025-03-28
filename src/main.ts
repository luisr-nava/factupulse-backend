import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { envs } from './config';
import { CurrentUserInterceptor } from './common/interceptors/current-user.interceptor';

async function bootstrap() {
  const logger = new Logger('FactuPulse');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'verbose'], // 🔹 Solo errores, oculta logs de NestJS
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // intercepta que usario esta haciendo la peticion
  // app.get(CurrentUserInterceptor);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
    }),
  );

  await app.listen(envs.port);

  logger.verbose(`Server is running on port ${envs.port}`);
}
bootstrap();
