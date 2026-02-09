import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UpdatePlayerRentalStatusDto } from './golf.types';

@Injectable()
export class PlayerRentalService {
  private readonly logger = new Logger(PlayerRentalService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Update a single player's rental status (cart/caddy)
   */
  async updatePlayerRentalStatus(
    tenantId: string,
    playerId: string,
    updates: UpdatePlayerRentalStatusDto,
    userId: string,
  ) {
    this.logger.log(`Updating player rental status: ${playerId}, updates: ${JSON.stringify(updates)}`);

    // Verify the player exists and belongs to a tee time in this tenant
    const player = await this.prisma.teeTimePlayer.findFirst({
      where: {
        id: playerId,
        teeTime: {
          course: {
            clubId: tenantId,
          },
        },
      },
      include: {
        teeTime: true,
        member: true,
        caddy: true,
      },
    });

    if (!player) {
      throw new NotFoundException(`Player not found: ${playerId}`);
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (updates.cartStatus !== undefined) {
      updateData.cartStatus = updates.cartStatus;
    }

    if (updates.caddyStatus !== undefined) {
      updateData.caddyStatus = updates.caddyStatus;
    }

    if (updates.caddyId !== undefined) {
      updateData.caddyId = updates.caddyId;
    }

    // Update the player
    const updatedPlayer = await this.prisma.teeTimePlayer.update({
      where: { id: playerId },
      data: updateData,
      include: {
        member: true,
        caddy: true,
      },
    });

    this.logger.log(`Updated player rental status: ${playerId}`);

    return updatedPlayer;
  }
}
