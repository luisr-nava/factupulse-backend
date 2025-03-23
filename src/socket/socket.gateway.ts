import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
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

  emitShopCreated(data: Shop) {
    this.server.emit('shop.created', data);
  }

  emitShopUpdated(data: Shop) {
    this.server.emit('shop.updated', data);
  }

  emitShopDeleted(data: Shop) {
    this.server.emit('shop.deleted', data);
  }

  emitCategoryCreated(data: ShopCategories) {
    this.server.emit('category.created', data);
  }
  emitCategoryUpdated(data: ShopCategories) {
    this.server.emit('category.updated', data);
  }
  emitCategoryDeleted(data: ShopCategories) {
    this.server.emit('category.deleted', data);
  }

  // Podés seguir agregando más métodos: updated, deleted, etc.
}
