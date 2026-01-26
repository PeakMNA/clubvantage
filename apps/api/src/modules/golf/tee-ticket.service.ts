import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface TeeTicketPlayer {
  position: number;
  name: string;
  type: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALKUP';
  memberId?: string;
  handicap?: number;
  cartType: string;
  caddyName?: string;
}

export interface TeeTicketData {
  ticketNumber: string;
  clubName: string;
  clubLogo?: string;
  courseName: string;
  teeDate: Date;
  teeTime: string;
  holes: number;
  players: TeeTicketPlayer[];
  cartAssignment?: string;
  caddyAssignment?: string;
  checkedInAt: Date;
  checkedInBy: string;
  notes?: string;
  qrCode?: string; // Base64 encoded QR code for scanning at starter station
  barcode?: string; // Barcode for quick lookup
}

@Injectable()
export class TeeTicketService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a tee ticket for a specific tee time
   */
  async generateTeeTicket(
    teeTimeId: string,
    clubId: string,
  ): Promise<TeeTicketData | null> {
    // Fetch tee time with all related data
    const teeTime = await this.prisma.teeTime.findFirst({
      where: { id: teeTimeId, clubId },
      include: {
        course: true,
        players: {
          include: {
            member: true,
            caddy: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!teeTime) {
      return null;
    }

    // Get club information
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    // Generate ticket number (based on tee time number + timestamp)
    const timestamp = Date.now().toString(36).toUpperCase();
    const ticketNumber = `TKT-${teeTime.teeTimeNumber.replace('TT-', '')}-${timestamp}`;

    // Build players array
    const players: TeeTicketPlayer[] = teeTime.players.map((player) => ({
      position: player.position,
      name: player.member
        ? `${player.member.firstName} ${player.member.lastName}`
        : player.guestName || 'Guest',
      type: player.playerType as TeeTicketPlayer['type'],
      memberId: player.member?.memberId,
      handicap: undefined, // Handicap stored elsewhere if needed
      cartType: player.cartType,
      caddyName: player.caddy
        ? `${player.caddy.firstName} ${player.caddy.lastName}`
        : undefined,
    }));

    // Get cart assignment if any player has a cart (SINGLE = has cart, WALKING = no cart)
    const cartAssignment = teeTime.players.some(
      (p) => p.cartType === 'SINGLE',
    )
      ? 'Cart Assigned'
      : undefined;

    // Get caddy assignment
    const caddyAssignments = teeTime.players
      .filter((p) => p.caddy)
      .map((p) => p.caddy!.firstName);
    const caddyAssignment =
      caddyAssignments.length > 0 ? caddyAssignments.join(', ') : undefined;

    // Generate a simple barcode representation (in production, use a barcode library)
    const barcode = this.generateBarcodeData(teeTime.teeTimeNumber);

    // Build ticket data
    const ticketData: TeeTicketData = {
      ticketNumber,
      clubName: club?.name || 'Golf Club',
      clubLogo: undefined, // Club logo stored elsewhere if needed
      courseName: teeTime.course?.name || 'Main Course',
      teeDate: teeTime.teeDate,
      teeTime: teeTime.teeTime,
      holes: teeTime.holes,
      players,
      cartAssignment,
      caddyAssignment,
      checkedInAt: new Date(), // Current time as check-in time
      checkedInBy: 'Pro Shop',
      notes: teeTime.notes ?? undefined,
      barcode,
    };

    return ticketData;
  }

  /**
   * Generate barcode data for the tee time number
   */
  private generateBarcodeData(teeTimeNumber: string): string {
    // Simple numeric encoding for barcode scanners
    // In production, use a proper barcode library
    return teeTimeNumber.replace(/[^0-9]/g, '').padStart(12, '0');
  }

  /**
   * Validate a tee ticket by its barcode
   */
  async validateTicket(
    barcode: string,
    clubId: string,
  ): Promise<{ valid: boolean; teeTimeId?: string; message?: string }> {
    // Extract tee time info from barcode
    const teeTime = await this.prisma.teeTime.findFirst({
      where: {
        clubId,
        teeTimeNumber: { contains: barcode.replace(/^0+/, '') },
      },
    });

    if (!teeTime) {
      return { valid: false, message: 'Invalid ticket barcode' };
    }

    // Check if tee time is today
    const today = new Date();
    const teeDate = new Date(teeTime.teeDate);
    if (teeDate.toDateString() !== today.toDateString()) {
      return {
        valid: false,
        teeTimeId: teeTime.id,
        message: 'Ticket is not valid for today',
      };
    }

    // Check if already used (status is on-course or completed)
    if (teeTime.status === 'COMPLETED') {
      return {
        valid: false,
        teeTimeId: teeTime.id,
        message: 'Ticket has already been used',
      };
    }

    return {
      valid: true,
      teeTimeId: teeTime.id,
      message: 'Valid ticket',
    };
  }
}
