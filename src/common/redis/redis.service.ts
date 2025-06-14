// src/common/redis.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger('RedisService');

  private client: Redis;

  onModuleInit() {
    this.logger.verbose('⏳ Inicializando conexión a Redis...');
    this.client = new Redis(process.env.REDIS_URL);

    this.client.on('connect', () => {
      this.logger.verbose('✅ Conexión a Redis establecida');
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ Error en Redis:', err);
    });
  }

  getClient(): Redis {
    return this.client;
  }
}
