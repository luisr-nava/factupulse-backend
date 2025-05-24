import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { envs } from './config';
import { CategorySeeder } from './database/seeders/category.seeder';
import { CustomSocketIoAdapter } from './socket/socket.adapter'; // 👈 Importamos tu nuevo Adapter

async function bootstrap() {
  const logger = new Logger('FactuPulse');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'verbose'],
  });

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: 'GET,POST',
    allowedHeaders: '*',
  });

  app.useWebSocketAdapter(new CustomSocketIoAdapter(app)); // 👈 Usamos el Custom Adapter

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  try {
    await app.listen(envs.port);
    logger.verbose(`🚀 Servidor ejecutándose en http://localhost:${envs.port}`);

    const seeder = app.get(CategorySeeder);
    await seeder.run();
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ El puerto ${envs.port} ya está en uso!`);
    } else {
      logger.error('❌ Error inesperado:', error);
    }
    process.exit(1);
  }
}

bootstrap();
