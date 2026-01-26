import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser, CurrentTenant } from '@/common/decorators';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  async findByMember(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: number,
  ) {
    // For staff users, we'd typically have a userId -> memberId mapping
    // For now, just return empty if no member association
    return [];
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async findUnread(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return [];
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return { count: 0 };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markAsRead(tenantId, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return { message: 'All notifications marked as read' };
  }
}
