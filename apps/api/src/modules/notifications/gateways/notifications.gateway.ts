import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*', // Configure properly in production
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('auth.jwt.secret'),
      });

      // Store user connection
      const userId = payload.sub;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user's personal room
      client.join(`user:${userId}`);

      // Join tenant room
      if (payload.tenantId) {
        client.join(`tenant:${payload.tenantId}`);
      }

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up user socket mapping
    for (const [userId, sockets] of this.userSockets.entries()) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:teesheet')
  handleTeesheetSubscribe(
    @MessageBody() data: { courseId: string; date: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `teesheet:${data.courseId}:${data.date}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { status: 'subscribed', room };
  }

  @SubscribeMessage('unsubscribe:teesheet')
  handleTeesheetUnsubscribe(
    @MessageBody() data: { courseId: string; date: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `teesheet:${data.courseId}:${data.date}`;
    client.leave(room);
    return { status: 'unsubscribed', room };
  }

  // Methods to emit events from services
  emitTeesheetUpdate(courseId: string, date: string, update: any) {
    const room = `teesheet:${courseId}:${date}`;
    this.server.to(room).emit('teesheet:updated', update);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  emitNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'notification:new', notification);
  }
}
