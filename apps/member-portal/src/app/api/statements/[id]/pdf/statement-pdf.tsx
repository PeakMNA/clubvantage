import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1c1917',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  clubName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#292524',
  },
  subtitle: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  badgePaid: {
    backgroundColor: '#d1fae5',
    color: '#047857',
  },
  badgeDue: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#292524',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#78716c',
  },
  value: {
    fontFamily: 'Helvetica-Bold',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d6d3d1',
    paddingBottom: 4,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f4',
  },
  colDate: { width: '12%', fontSize: 8 },
  colDesc: { width: '38%' },
  colRef: { width: '15%', fontSize: 8, color: '#a8a29e' },
  colCategory: { width: '10%', fontSize: 8, color: '#78716c' },
  colDebit: { width: '12.5%', textAlign: 'right' },
  colCredit: { width: '12.5%', textAlign: 'right', color: '#047857' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    borderTopColor: '#292524',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  totalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#a8a29e',
  },
})

function fmt(n: number): string {
  return `฿${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface StatementTransaction {
  date: string
  description: string
  reference?: string
  debit?: number
  credit?: number
  balance?: number
  category?: string
}

interface StatementData {
  id: string
  statementNumber: string | null
  periodStart: Date
  periodEnd: Date
  dueDate: Date
  openingBalance: number
  totalDebits: number
  totalCredits: number
  closingBalance: number
  agingCurrent: number
  aging1to30: number
  aging31to60: number
  aging61to90: number
  aging90Plus: number
  transactionCount: number
  transactions: StatementTransaction[]
  pdfUrl: string | null
  memberName: string | null
  memberDisplayId: string | null
  membershipType: string | null
  accountNumber: string
}

export function StatementPdf({ statement }: { statement: StatementData }) {
  const isPaid = statement.closingBalance <= 0
  const periodLabel = format(new Date(statement.periodStart), 'MMMM yyyy')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.clubName}>Royal Club</Text>
            <Text style={styles.subtitle}>Member Statement — {periodLabel}</Text>
            {statement.statementNumber && (
              <Text style={[styles.subtitle, { marginTop: 2 }]}>
                #{statement.statementNumber}
              </Text>
            )}
          </View>
          <View style={[styles.badge, isPaid ? styles.badgePaid : styles.badgeDue]}>
            <Text>{isPaid ? 'PAID' : 'DUE'}</Text>
          </View>
        </View>

        {/* Member Info */}
        {statement.memberName && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Member Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{statement.memberName}</Text>
            </View>
            {statement.memberDisplayId && (
              <View style={styles.row}>
                <Text style={styles.label}>Member ID</Text>
                <Text>{statement.memberDisplayId}</Text>
              </View>
            )}
            {statement.membershipType && (
              <View style={styles.row}>
                <Text style={styles.label}>Membership</Text>
                <Text>{statement.membershipType}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Account</Text>
              <Text>{statement.accountNumber}</Text>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* Period & Balance Summary */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Period</Text>
            <Text>
              {format(new Date(statement.periodStart), 'MMM d')} –{' '}
              {format(new Date(statement.periodEnd), 'MMM d, yyyy')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Opening Balance</Text>
            <Text>{fmt(statement.openingBalance)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Charges</Text>
            <Text>{fmt(statement.totalDebits)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payments & Credits</Text>
            <Text style={{ color: '#047857' }}>-{fmt(statement.totalCredits)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Closing Balance</Text>
            <Text style={styles.totalValue}>{fmt(statement.closingBalance)}</Text>
          </View>
          {!isPaid && (
            <View style={[styles.row, { marginTop: 4 }]}>
              <Text style={styles.label}>Due by</Text>
              <Text style={{ color: '#b45309', fontFamily: 'Helvetica-Bold' }}>
                {format(new Date(statement.dueDate), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Aging Breakdown */}
        {statement.agingCurrent + statement.aging1to30 + statement.aging31to60 + statement.aging61to90 + statement.aging90Plus > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Aging</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Current</Text>
              <Text>{fmt(statement.agingCurrent)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>1–30 days</Text>
              <Text>{fmt(statement.aging1to30)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>31–60 days</Text>
              <Text>{fmt(statement.aging31to60)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>61–90 days</Text>
              <Text>{fmt(statement.aging61to90)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>90+ days</Text>
              <Text>{fmt(statement.aging90Plus)}</Text>
            </View>
          </View>
        )}

        {/* Transactions Table */}
        {statement.transactions.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              Transactions ({statement.transactionCount})
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDate, { fontFamily: 'Helvetica-Bold' }]}>Date</Text>
              <Text style={[styles.colDesc, { fontFamily: 'Helvetica-Bold' }]}>Description</Text>
              <Text style={[styles.colRef, { fontFamily: 'Helvetica-Bold' }]}>Ref</Text>
              <Text style={[styles.colCategory, { fontFamily: 'Helvetica-Bold' }]}>Category</Text>
              <Text style={[styles.colDebit, { fontFamily: 'Helvetica-Bold' }]}>Debit</Text>
              <Text style={[styles.colCredit, { fontFamily: 'Helvetica-Bold' }]}>Credit</Text>
            </View>
            {statement.transactions.map((tx, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={styles.colDate}>{tx.date}</Text>
                <Text style={styles.colDesc}>{tx.description}</Text>
                <Text style={styles.colRef}>{tx.reference ?? ''}</Text>
                <Text style={styles.colCategory}>{tx.category ?? ''}</Text>
                <Text style={styles.colDebit}>
                  {tx.debit ? fmt(tx.debit) : ''}
                </Text>
                <Text style={styles.colCredit}>
                  {tx.credit ? fmt(tx.credit) : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This statement was generated by Royal Club Member Portal. For questions, contact your club.
        </Text>
      </Page>
    </Document>
  )
}
