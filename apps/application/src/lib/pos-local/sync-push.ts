/**
 * EOD Sync — Local → Cloud
 *
 * Pushes locally-stored transactions (tickets, payments, F&B tables)
 * to the cloud GraphQL API during end-of-day settlement.
 */

import { request } from '@clubvantage/api-client';
import type { IPOSLocalDB } from './sync-provider';

// ============================================================================
// GraphQL mutations for sync
// ============================================================================

const SYNC_POS_TICKET_MUTATION = `
  mutation SyncPosTicket($input: SyncPosTicketInput!) {
    syncPosTicket(input: $input) {
      success
      message
      ticketId
    }
  }
`;

const SYNC_FNB_TABLE_MUTATION = `
  mutation SyncFnbTable($input: SyncFnbTableInput!) {
    syncFnbTable(input: $input) {
      success
      message
    }
  }
`;

// ============================================================================
// Sync queue operations
// ============================================================================

/** Add an entry to the sync queue */
export async function enqueueSyncRecord(
  db: IPOSLocalDB,
  entityType: string,
  entityId: string,
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  data: Record<string, unknown>
): Promise<void> {
  await db.run(
    `INSERT INTO sync_queue (entity_type, entity_id, operation, data, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [entityType, entityId, operation, JSON.stringify(data)]
  );
}

/** Get count of pending sync records */
export async function getPendingSyncCount(db: IPOSLocalDB): Promise<number> {
  const row = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'"
  );
  return row?.count || 0;
}

// ============================================================================
// EOD settlement
// ============================================================================

export interface EODSummary {
  totalTickets: number;
  totalSales: number;
  paymentBreakdown: Record<string, number>;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Check if the station is ready for EOD settlement.
 * Returns list of blocking issues, or empty array if ready.
 */
export async function checkEODReadiness(db: IPOSLocalDB): Promise<string[]> {
  const issues: string[] = [];

  const openTickets = await db.all<{ id: string; status: string; ticket_number: string }>(
    "SELECT id, status, ticket_number FROM tickets WHERE status IN ('OPEN', 'HELD')"
  );

  for (const ticket of openTickets) {
    issues.push(
      `Ticket ${ticket.ticket_number || ticket.id} is still ${ticket.status.toLowerCase()}`
    );
  }

  return issues;
}

/**
 * Generate EOD summary from local data.
 */
export async function generateEODSummary(db: IPOSLocalDB): Promise<EODSummary> {
  // Count settled tickets
  const ticketCount = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM tickets WHERE status = 'SETTLED'"
  );

  // Total sales
  const salesTotal = await db.get<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM tickets WHERE status = 'SETTLED'"
  );

  // Payment method breakdown
  const payments = await db.all<{ method: string; total: number }>(
    `SELECT tp.method, COALESCE(SUM(tp.amount), 0) as total
     FROM ticket_payments tp
     JOIN tickets t ON t.id = tp.ticket_id
     WHERE t.status = 'SETTLED'
     GROUP BY tp.method`
  );

  const paymentBreakdown: Record<string, number> = {};
  for (const p of payments) {
    paymentBreakdown[p.method] = p.total;
  }

  return {
    totalTickets: ticketCount?.count || 0,
    totalSales: salesTotal?.total || 0,
    paymentBreakdown,
    syncedCount: 0,
    failedCount: 0,
    errors: [],
  };
}

/**
 * Push all pending sync records to the cloud.
 * Processes records in order, marks each as synced or error.
 */
export async function syncPushToCloud(db: IPOSLocalDB): Promise<EODSummary> {
  const summary = await generateEODSummary(db);

  // Get all pending sync records ordered by creation time
  const pendingRecords = await db.all<{
    id: number;
    entity_type: string;
    entity_id: string;
    operation: string;
    data: string;
  }>("SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC");

  for (const record of pendingRecords) {
    try {
      const data = JSON.parse(record.data);

      switch (record.entity_type) {
        case 'ticket': {
          // Fetch full ticket data including line items and payments
          const ticket = await db.get<any>(
            'SELECT * FROM tickets WHERE id = ?',
            [record.entity_id]
          );
          const lineItems = await db.all<any>(
            'SELECT * FROM ticket_line_items WHERE ticket_id = ?',
            [record.entity_id]
          );
          const payments = await db.all<any>(
            'SELECT * FROM ticket_payments WHERE ticket_id = ?',
            [record.entity_id]
          );

          if (ticket) {
            await request<any>(SYNC_POS_TICKET_MUTATION, {
              input: {
                ...data,
                ticket: {
                  id: ticket.id,
                  outletId: ticket.outlet_id,
                  stationId: ticket.station_id,
                  ticketNumber: ticket.ticket_number,
                  staffId: ticket.staff_id,
                  memberId: ticket.member_id,
                  memberName: ticket.member_name,
                  memberNumber: ticket.member_number,
                  status: ticket.status,
                  subtotal: ticket.subtotal,
                  discountTotal: ticket.discount_total,
                  taxAmount: ticket.tax_amount,
                  total: ticket.total,
                  amountPaid: ticket.amount_paid,
                  createdAt: ticket.created_at,
                  settledAt: ticket.settled_at,
                },
                lineItems: lineItems.map((li: any) => ({
                  id: li.id,
                  productId: li.product_id,
                  name: li.name,
                  quantity: li.quantity,
                  unitPrice: li.unit_price,
                  variantId: li.variant_id,
                  variantName: li.variant_name,
                  modifiers: li.modifiers,
                  totalPrice: li.total_price,
                  notes: li.notes,
                })),
                payments: payments.map((p: any) => ({
                  id: p.id,
                  method: p.method,
                  amount: p.amount,
                  reference: p.reference,
                  processedAt: p.processed_at,
                })),
              },
            });
          }
          break;
        }

        case 'fnb_table': {
          const table = await db.get<any>(
            'SELECT * FROM fnb_tables WHERE id = ?',
            [record.entity_id]
          );

          if (table) {
            await request<any>(SYNC_FNB_TABLE_MUTATION, {
              input: {
                id: table.id,
                outletId: table.outlet_id,
                tableNumber: table.table_number,
                status: table.status,
                guestCount: table.guest_count,
                ticketId: table.ticket_id,
                openedAt: table.opened_at,
              },
            });
          }
          break;
        }

        default:
          console.warn(`[sync-push] Unknown entity type: ${record.entity_type}`);
      }

      // Mark as synced
      await db.run(
        "UPDATE sync_queue SET status = 'synced', attempted_at = datetime('now') WHERE id = ?",
        [record.id]
      );
      summary.syncedCount++;

      // Also mark ticket as synced
      if (record.entity_type === 'ticket') {
        await db.run('UPDATE tickets SET synced = 1 WHERE id = ?', [record.entity_id]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await db.run(
        "UPDATE sync_queue SET status = 'error', attempted_at = datetime('now'), error = ? WHERE id = ?",
        [errorMsg, record.id]
      );
      summary.failedCount++;
      summary.errors.push(`${record.entity_type}/${record.entity_id}: ${errorMsg}`);
    }
  }

  return summary;
}
