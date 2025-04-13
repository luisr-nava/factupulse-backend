import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketEvent } from 'src/enums';
import { ShopCategories } from 'src/shop/category/entities/category.entity';
import { Shop } from 'src/shop/entities/shop.entity';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  emit<T>(event: SocketEvent, data: T) {
    this.server.emit(event, data);
  }
}
