import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common'; // CORRECTO
import { ServerOptions } from 'socket.io';
import { Server } from 'socket.io';

export class CustomSocketIoAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const httpServer = this.app.getHttpServer(); // 👈 CORREGIDO, usamos getHttpServer()
    const server = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:3001',
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: '*',
      },
      ...options,
    });
    return server;
  }
}
