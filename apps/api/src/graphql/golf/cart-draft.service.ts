import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CartDraftData {
  slots: Array<{
    playerId: string;
    position: number;
    pendingItems?: Array<{
      tempId: string;
      type: string;
      description: string;
      amount: number;
    }>;
  }>;
  pendingTransfers?: Array<{
    lineItemId: string;
    fromPlayerId: string;
    toPlayerId: string;
  }>;
  lastModified?: string;
  modifiedBy?: string;
}

export interface CartDraft {
  id: string;
  teeTimeId: string;
  draftData: CartDraftData;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

@Injectable()
export class CartDraftService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save or update a cart draft for a tee time
   */
  async saveDraft(
    teeTimeId: string,
    data: CartDraftData,
    userId: string,
  ): Promise<CartDraft> {
    // Add metadata
    const draftData = {
      ...data,
      lastModified: new Date().toISOString(),
      modifiedBy: userId,
    };

    const draft = await this.prisma.cartDraft.upsert({
      where: { teeTimeId },
      create: {
        teeTimeId,
        draftData,
        createdBy: userId,
      },
      update: {
        draftData,
      },
    });

    return {
      id: draft.id,
      teeTimeId: draft.teeTimeId,
      draftData: draft.draftData as unknown as CartDraftData,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
    };
  }

  /**
   * Get a cart draft by tee time ID
   */
  async getDraft(teeTimeId: string): Promise<CartDraft | null> {
    const draft = await this.prisma.cartDraft.findUnique({
      where: { teeTimeId },
    });

    if (!draft) {
      return null;
    }

    return {
      id: draft.id,
      teeTimeId: draft.teeTimeId,
      draftData: draft.draftData as unknown as CartDraftData,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
    };
  }

  /**
   * Clear a cart draft (after check-in is complete)
   */
  async clearDraft(teeTimeId: string): Promise<boolean> {
    try {
      await this.prisma.cartDraft.delete({
        where: { teeTimeId },
      });
      return true;
    } catch {
      // Draft may not exist, which is fine
      return false;
    }
  }

  /**
   * Check if a tee time has a draft
   */
  async hasDraft(teeTimeId: string): Promise<boolean> {
    const count = await this.prisma.cartDraft.count({
      where: { teeTimeId },
    });
    return count > 0;
  }

  /**
   * Get all tee times with drafts for a specific date (for tee sheet display)
   */
  async getTeeTimesWithDrafts(
    clubId: string,
    date: Date,
  ): Promise<string[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const drafts = await this.prisma.cartDraft.findMany({
      where: {
        teeTime: {
          clubId,
          teeDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      select: {
        teeTimeId: true,
      },
    });

    return drafts.map(d => d.teeTimeId);
  }

  /**
   * Cleanup old drafts (older than specified days)
   * Can be called periodically to prevent stale data
   */
  async cleanupOldDrafts(daysOld: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.cartDraft.deleteMany({
      where: {
        updatedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
