import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  StarterTicketResponseType,
  StarterTicketPlayerType,
  CheckInPlayerType,
  TicketGenerateOn,
  PrintOption,
} from './golf.types';

/**
 * Ticket content for rendering
 */
export interface TicketRenderData {
  ticketNumber: string;
  clubName: string;
  clubLogo?: string;
  courseName: string;
  teeDate: string;
  teeTime: string;
  startingHole: number;
  players: Array<{
    name: string;
    memberNumber?: string;
    type: string;
    handicap?: number;
  }>;
  cartNumber?: string;
  caddyAssignment?: string;
  rentalItems: string[];
  specialRequests?: string;
  qrCodeData: string;
  generatedAt: string;
  generatedBy: string;
}

/**
 * Print job result
 */
export interface PrintJobResult {
  success: boolean;
  jobId?: string;
  error?: string;
  printedAt?: Date;
}

/**
 * Service for starter ticket printing and PDF generation
 */
@Injectable()
export class TicketPrintService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // TICKET RENDERING
  // ============================================================================

  /**
   * Get ticket render data for a tee time
   */
  async getTicketRenderData(teeTimeId: string): Promise<TicketRenderData> {
    const ticket = await this.prisma.starterTicket.findFirst({
      where: { teeTimeId },
      include: {
        teeTime: {
          include: {
            course: {
              include: { club: true },
            },
            players: {
              include: {
                member: true,
                dependent: { include: { member: true } },
                caddy: true,
              },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Starter ticket not found');
    }

    const teeTime = ticket.teeTime;
    const club = teeTime.course?.club;

    // Format players - define type for player with includes
    type PlayerWithIncludes = (typeof teeTime.players)[0];
    const players = teeTime.players.map((p: PlayerWithIncludes) => {
      let name = 'Walk-up';
      let memberNumber: string | undefined;
      let type = 'W';

      if (p.member) {
        name = `${p.member.firstName} ${p.member.lastName}`;
        memberNumber = p.member.memberId;
        type = 'M';
      } else if (p.dependent) {
        name = `${p.dependent.firstName} ${p.dependent.lastName}`;
        memberNumber = p.dependent.member?.memberId;
        type = 'D';
      } else if (p.guestName) {
        name = p.guestName;
        type = 'G';
      }

      return { name, memberNumber, type, handicap: undefined };
    });

    // Collect caddy assignments
    const caddyNames = teeTime.players
      .filter((p: PlayerWithIncludes) => p.caddy)
      .map((p: PlayerWithIncludes) => `${p.caddy!.firstName} ${p.caddy!.lastName}`)
      .filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index);

    // Collect rental items
    const rentalItems = teeTime.players
      .filter((p: PlayerWithIncludes) => p.rentalRequest)
      .map((p: PlayerWithIncludes) => p.rentalRequest!)
      .filter((item: string, index: number, arr: string[]) => arr.indexOf(item) === index);

    // Get cart number
    const cartNumber = teeTime.players.find((p: PlayerWithIncludes) => p.cartRequest)?.cartRequest;

    // Format date/time
    const teeDate = new Date(teeTime.teeDate);
    const formattedDate = teeDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      ticketNumber: ticket.ticketNumber,
      clubName: club?.name || 'Golf Club',
      clubLogo: undefined, // Club logo URL if available
      courseName: teeTime.course?.name || 'Course',
      teeDate: formattedDate,
      teeTime: teeTime.teeTime,
      startingHole: teeTime.startingHole,
      players,
      cartNumber: cartNumber || undefined,
      caddyAssignment: caddyNames.length > 0 ? caddyNames.join(', ') : undefined,
      rentalItems,
      specialRequests: teeTime.notes || undefined,
      qrCodeData: `TKT:${ticket.ticketNumber}`,
      generatedAt: ticket.generatedAt.toISOString(),
      generatedBy: ticket.generatedBy,
    };
  }

  /**
   * Generate HTML template for ticket
   */
  async generateTicketHTML(teeTimeId: string): Promise<string> {
    const data = await this.getTicketRenderData(teeTimeId);

    // Get ticket content settings
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: { course: { include: { club: true } } },
    });

    const clubId = teeTime?.course?.clubId;
    const settings = clubId
      ? await this.prisma.clubGolfSettings.findUnique({ where: { clubId } })
      : null;

    // Build HTML template
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Starter Ticket - ${data.ticketNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 5mm; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      padding: 10px;
      max-width: 280px;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .club-name {
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .ticket-number {
      font-size: 14px;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 10px;
    }
    .section-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 5px;
    }
    .tee-info {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: bold;
      background: #f0f0f0;
      padding: 8px;
      margin-bottom: 10px;
    }
    .player-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      border-bottom: 1px dotted #ccc;
    }
    .player-name {
      flex: 1;
    }
    .player-type {
      width: 30px;
      text-align: center;
    }
    .player-member {
      width: 60px;
      text-align: right;
      font-size: 10px;
    }
    .qr-section {
      text-align: center;
      margin-top: 15px;
      padding-top: 10px;
      border-top: 2px dashed #000;
    }
    .qr-placeholder {
      width: 100px;
      height: 100px;
      margin: 10px auto;
      border: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 10px;
      color: #666;
    }
    .notes {
      background: #fff8dc;
      padding: 5px;
      margin-top: 10px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="club-name">${this.escapeHtml(data.clubName)}</div>
    <div class="ticket-number">#${data.ticketNumber}</div>
  </div>

  <div class="tee-info">
    <div>
      <div>${data.teeDate}</div>
      <div>${data.teeTime}</div>
    </div>
    <div style="text-align: right;">
      <div>${this.escapeHtml(data.courseName)}</div>
      <div>Hole ${data.startingHole}</div>
    </div>
  </div>

  ${settings?.ticketShowPlayerNames !== false ? `
  <div class="section">
    <div class="section-title">PLAYERS</div>
    ${data.players.map((p: { name: string; memberNumber?: string; type: string }) => `
      <div class="player-row">
        <span class="player-name">${this.escapeHtml(p.name)}</span>
        <span class="player-type">[${p.type}]</span>
        ${settings?.ticketShowMemberNumbers !== false && p.memberNumber ? `<span class="player-member">${p.memberNumber}</span>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${settings?.ticketShowCartNumber !== false && data.cartNumber ? `
  <div class="section">
    <div class="section-title">CART</div>
    <div>${data.cartNumber}</div>
  </div>
  ` : ''}

  ${settings?.ticketShowCaddyName !== false && data.caddyAssignment ? `
  <div class="section">
    <div class="section-title">CADDY</div>
    <div>${this.escapeHtml(data.caddyAssignment)}</div>
  </div>
  ` : ''}

  ${settings?.ticketShowRentalItems !== false && data.rentalItems.length > 0 ? `
  <div class="section">
    <div class="section-title">RENTALS</div>
    ${data.rentalItems.map((item: string) => `<div>• ${this.escapeHtml(item)}</div>`).join('')}
  </div>
  ` : ''}

  ${settings?.ticketShowSpecialReqs !== false && data.specialRequests ? `
  <div class="notes">
    <strong>Notes:</strong> ${this.escapeHtml(data.specialRequests)}
  </div>
  ` : ''}

  ${settings?.ticketShowQRCode !== false ? `
  <div class="qr-section">
    <div class="qr-placeholder">
      QR: ${data.qrCodeData}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    Generated: ${new Date(data.generatedAt).toLocaleString()}
  </div>
</body>
</html>
    `.trim();

    return html;
  }

  /**
   * Generate receipt HTML for payment
   */
  async generateReceiptHTML(
    teeTimeId: string,
    playerId: string,
  ): Promise<string> {
    const player = await this.prisma.teeTimePlayer.findUnique({
      where: { id: playerId },
      include: {
        member: true,
        dependent: { include: { member: true } },
        lineItems: true,
        teeTime: {
          include: {
            course: { include: { club: true } },
          },
        },
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const club = player.teeTime.course?.club;
    const lineItems = player.lineItems || [];

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.baseAmount), 0);
    const totalTax = lineItems.reduce((sum, item) => sum + Number(item.taxAmount), 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const paid = lineItems.filter((i) => i.isPaid).reduce((sum, item) => sum + Number(item.totalAmount), 0);

    // Get player name
    let playerName = 'Guest';
    if (player.member) {
      playerName = `${player.member.firstName} ${player.member.lastName}`;
    } else if (player.dependent) {
      playerName = `${player.dependent.firstName} ${player.dependent.lastName}`;
    } else if (player.guestName) {
      playerName = player.guestName;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${playerName}</title>
  <style>
    @page { size: 80mm auto; margin: 5mm; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      padding: 10px;
      max-width: 280px;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .club-name {
      font-size: 16px;
      font-weight: bold;
    }
    .receipt-title {
      font-size: 14px;
      margin-top: 5px;
    }
    .customer {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
    }
    .line-item {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
    }
    .line-item-desc {
      flex: 1;
    }
    .line-item-amount {
      text-align: right;
      min-width: 60px;
    }
    .totals {
      border-top: 2px solid #000;
      margin-top: 10px;
      padding-top: 10px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
    }
    .grand-total {
      font-size: 14px;
      font-weight: bold;
      border-top: 1px solid #000;
      margin-top: 5px;
      padding-top: 5px;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 15px;
      padding-top: 10px;
      border-top: 2px dashed #000;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="club-name">${this.escapeHtml(club?.name || 'Golf Club')}</div>
    <div class="receipt-title">RECEIPT</div>
  </div>

  <div class="customer">
    <div><strong>${this.escapeHtml(playerName)}</strong></div>
    <div>${new Date().toLocaleString()}</div>
  </div>

  <div class="items">
    ${lineItems.map((item) => `
      <div class="line-item">
        <span class="line-item-desc">${this.escapeHtml(item.description)}</span>
        <span class="line-item-amount">$${Number(item.totalAmount).toFixed(2)}</span>
      </div>
    `).join('')}
  </div>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Tax</span>
      <span>$${totalTax.toFixed(2)}</span>
    </div>
    <div class="total-row grand-total">
      <span>TOTAL</span>
      <span>$${grandTotal.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Paid</span>
      <span>$${paid.toFixed(2)}</span>
    </div>
    ${grandTotal - paid > 0 ? `
    <div class="total-row" style="color: red;">
      <span>Balance Due</span>
      <span>$${(grandTotal - paid).toFixed(2)}</span>
    </div>
    ` : ''}
  </div>

  <div class="footer">
    <div>Thank you for playing!</div>
    <div>See you on the course.</div>
  </div>
</body>
</html>
    `.trim();

    return html;
  }

  // ============================================================================
  // PRINT OPERATIONS
  // ============================================================================

  /**
   * Send ticket to printer (stub for actual printer integration)
   */
  async printTicket(
    ticketId: string,
    printOption: PrintOption = PrintOption.TICKET,
    copies: number = 1,
  ): Promise<PrintJobResult> {
    const ticket = await this.prisma.starterTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    // In a real implementation, this would send to a print service
    // For now, we just update the ticket record
    const printedAt = new Date();
    await this.prisma.starterTicket.update({
      where: { id: ticketId },
      data: {
        printedAt,
        reprintCount: { increment: 1 },
      },
    });

    return {
      success: true,
      jobId: `PRINT-${ticketId}-${Date.now()}`,
      printedAt,
    };
  }

  // ============================================================================
  // TICKET VALIDATION
  // ============================================================================

  /**
   * Validate a ticket by QR code data
   */
  async validateTicket(qrCodeData: string): Promise<{
    valid: boolean;
    ticketId?: string;
    teeTimeId?: string;
    message?: string;
    ticketData?: TicketRenderData;
  }> {
    // Parse QR code format: TKT:TICKET_NUMBER
    if (!qrCodeData.startsWith('TKT:')) {
      return { valid: false, message: 'Invalid ticket format' };
    }

    const ticketNumber = qrCodeData.substring(4);
    const ticket = await this.prisma.starterTicket.findFirst({
      where: { ticketNumber },
      include: { teeTime: true },
    });

    if (!ticket) {
      return { valid: false, message: 'Ticket not found' };
    }

    // Check if tee time is for today
    const today = new Date();
    const teeDate = new Date(ticket.teeTime.teeDate);
    const isToday =
      teeDate.getFullYear() === today.getFullYear() &&
      teeDate.getMonth() === today.getMonth() &&
      teeDate.getDate() === today.getDate();

    if (!isToday) {
      return {
        valid: false,
        ticketId: ticket.id,
        teeTimeId: ticket.teeTimeId,
        message: `Ticket is for ${teeDate.toLocaleDateString()}, not today`,
      };
    }

    // Get full ticket data
    const ticketData = await this.getTicketRenderData(ticket.teeTimeId);

    return {
      valid: true,
      ticketId: ticket.id,
      teeTimeId: ticket.teeTimeId,
      ticketData,
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
