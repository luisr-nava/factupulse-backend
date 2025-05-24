import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // transports: ['websocket'],
  namespace: '/',
  pingTimeout: 60000, // 👈 AQUI
  pingInterval: 25000, // 👈 AQUI
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // 👈 Usamos WebSocketServer normal

  handleConnection(client: Socket) {
    console.log('🔥 Cliente conectado:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Cliente desconectado:', client.id);
  }

  emit<T>(event: string, data: T) {
    this.server.emit(event, data);
  }
}
