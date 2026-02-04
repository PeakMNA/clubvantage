/**
 * ClubVantage Billing/Statement Seed Script
 * Creates comprehensive billing data for testing statements
 *
 * Run with: npx ts-node prisma/seed-billing.ts
 */

import {
  PrismaClient,
  InvoiceStatus,
  PaymentMethod,
  CreditNoteType,
  CreditNoteReason,
  CreditNoteStatus,
  UserRole,
  CityLedgerType,
  CityLedgerStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🏦 Starting billing/statement seed...');

  // Get the demo club
  const club = await prisma.club.findFirst({
    where: { slug: 'royal-bangkok-club' },
  });

  if (!club) {
    console.error('❌ Demo club not found. Run the main seed first.');
    process.exit(1);
  }

  // Get charge types
  const chargeTypes = await prisma.chargeType.findMany({
    where: { clubId: club.id },
  });

  const chargeTypeMap = new Map(chargeTypes.map((ct) => [ct.code, ct]));

  // Get members
  const members = await prisma.member.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  if (members.length < 10) {
    console.error('❌ Not enough members found. Run the main seed first.');
    process.exit(1);
  }

  // Get admin user for audit trails
  const adminUser = await prisma.user.findFirst({
    where: { clubId: club.id, role: UserRole.ADMIN },
  });

  console.log(`📊 Found ${members.length} members and ${chargeTypes.length} charge types`);

  // ============================================================================
  // CREATE 6 MONTHS OF BILLING HISTORY
  // ============================================================================
  console.log('📄 Creating 6 months of billing history...');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let invoiceCounter = 100; // Start after existing invoices
  let paymentCounter = 100;
  let creditNoteCounter = 1;

  const allInvoices: any[] = [];
  const allPayments: any[] = [];

  // Generate 6 months of data (current month + 5 previous months)
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const billingMonth = new Date(currentYear, currentMonth - monthOffset, 1);
    const billingPeriod = billingMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const invoiceDate = new Date(currentYear, currentMonth - monthOffset, 1);
    const dueDate = new Date(currentYear, currentMonth - monthOffset, 15);

    console.log(`  📅 Creating invoices for ${billingPeriod}...`);

    // Create invoices for each member
    for (let m = 0; m < Math.min(members.length, 15); m++) {
      const member = members[m];
      invoiceCounter++;

      const invoiceNumber = `INV-${currentYear}-${String(invoiceCounter).padStart(5, '0')}`;

      // Determine invoice status based on age and randomness
      let status: InvoiceStatus;
      let paidAmount = 0;

      if (monthOffset >= 2) {
        // Older invoices - mostly paid
        status = Math.random() > 0.1 ? InvoiceStatus.PAID : InvoiceStatus.OVERDUE;
      } else if (monthOffset === 1) {
        // Last month - mix of statuses
        const rand = Math.random();
        if (rand < 0.6) status = InvoiceStatus.PAID;
        else if (rand < 0.8) status = InvoiceStatus.PARTIALLY_PAID;
        else if (rand < 0.9) status = InvoiceStatus.SENT;
        else status = InvoiceStatus.OVERDUE;
      } else {
        // Current month - mostly unpaid
        const rand = Math.random();
        if (rand < 0.3) status = InvoiceStatus.PAID;
        else if (rand < 0.5) status = InvoiceStatus.SENT;
        else status = InvoiceStatus.DRAFT;
      }

      // Generate line items
      const lineItems: {
        chargeTypeId: string | null;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        taxType: string;
      }[] = [];

      // Monthly membership dues (always included)
      const monthlyFeeType = chargeTypeMap.get('MONTHLY_FEE');
      if (monthlyFeeType) {
        lineItems.push({
          chargeTypeId: monthlyFeeType.id,
          description: `Monthly Membership Dues - ${billingPeriod}`,
          quantity: 1,
          unitPrice: 15000 + Math.floor(Math.random() * 5000), // 15,000 - 20,000
          taxRate: 7,
          taxType: 'VAT',
        });
      }

      // Random additional charges
      const greenFeeType = chargeTypeMap.get('GREEN_FEE');
      const cartFeeType = chargeTypeMap.get('CART_FEE');
      const caddyFeeType = chargeTypeMap.get('CADDY_FEE');
      const fbChargeType = chargeTypeMap.get('FB_CHARGE');

      // Golf charges (70% chance)
      if (Math.random() < 0.7 && greenFeeType) {
        const rounds = Math.floor(Math.random() * 4) + 1;
        lineItems.push({
          chargeTypeId: greenFeeType.id,
          description: `Green Fees (${rounds} round${rounds > 1 ? 's' : ''})`,
          quantity: rounds,
          unitPrice: 2500,
          taxRate: 7,
          taxType: 'VAT',
        });

        // Cart fee if playing golf (60% chance)
        if (Math.random() < 0.6 && cartFeeType) {
          lineItems.push({
            chargeTypeId: cartFeeType.id,
            description: 'Golf Cart Rental',
            quantity: rounds,
            unitPrice: 800,
            taxRate: 7,
            taxType: 'VAT',
          });
        }

        // Caddy fee (40% chance)
        if (Math.random() < 0.4 && caddyFeeType) {
          lineItems.push({
            chargeTypeId: caddyFeeType.id,
            description: 'Caddy Service',
            quantity: rounds,
            unitPrice: 500,
            taxRate: 0,
            taxType: 'EXEMPT',
          });
        }
      }

      // F&B charges (80% chance)
      if (Math.random() < 0.8 && fbChargeType) {
        const fbAmount = Math.floor(Math.random() * 8) + 1;
        lineItems.push({
          chargeTypeId: fbChargeType.id,
          description: 'Food & Beverage Charges',
          quantity: fbAmount,
          unitPrice: Math.floor(Math.random() * 500) + 200,
          taxRate: 7,
          taxType: 'VAT',
        });
      }

      // Calculate totals
      let subtotal = 0;
      let taxAmount = 0;

      const lineItemsWithTotals = lineItems.map((item, index) => {
        const lineTotal = item.quantity * item.unitPrice;
        const lineTax = lineTotal * (item.taxRate / 100);
        subtotal += lineTotal;
        taxAmount += lineTax;

        return {
          ...item,
          lineTotal,
          discountPct: 0,
          sortOrder: index,
        };
      });

      const totalAmount = subtotal + taxAmount;

      // Set paid amount based on status
      if (status === InvoiceStatus.PAID) {
        paidAmount = totalAmount;
      } else if (status === InvoiceStatus.PARTIALLY_PAID) {
        paidAmount = Math.round(totalAmount * (0.3 + Math.random() * 0.4)); // 30-70%
      }

      const balanceDue = totalAmount - paidAmount;

      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findUnique({
        where: { clubId_invoiceNumber: { clubId: club.id, invoiceNumber } },
      });

      if (existingInvoice) {
        allInvoices.push(existingInvoice);
        continue;
      }

      // Create invoice with line items
      const invoice = await prisma.invoice.create({
        data: {
          clubId: club.id,
          memberId: member.id,
          invoiceNumber,
          invoiceDate,
          dueDate,
          billingPeriod,
          subtotal,
          taxAmount,
          discountAmount: 0,
          totalAmount,
          paidAmount,
          balanceDue,
          status,
          sentAt: status !== InvoiceStatus.DRAFT ? invoiceDate : null,
          paidDate: status === InvoiceStatus.PAID ? dueDate : null,
          lineItems: {
            create: lineItemsWithTotals,
          },
        },
      });

      allInvoices.push(invoice);

      // Create payment if paid or partially paid
      if (paidAmount > 0) {
        paymentCounter++;
        const receiptNumber = `RCP-${currentYear}-${String(paymentCounter).padStart(5, '0')}`;
        const paymentDate = new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000);

        const paymentMethods = [PaymentMethod.CREDIT_CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH];
        const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        const existingPayment = await prisma.payment.findUnique({
          where: { clubId_receiptNumber: { clubId: club.id, receiptNumber } },
        });

        if (!existingPayment) {
          const payment = await prisma.payment.create({
            data: {
              clubId: club.id,
              memberId: member.id,
              receiptNumber,
              amount: paidAmount,
              method,
              paymentDate,
              referenceNumber:
                method === PaymentMethod.CREDIT_CARD
                  ? `ch_${Math.random().toString(36).substring(2, 15)}`
                  : method === PaymentMethod.BANK_TRANSFER
                  ? `TRF-${Date.now()}-${paymentCounter}`
                  : `CASH-${Date.now()}-${paymentCounter}`,
              bankName: method === PaymentMethod.BANK_TRANSFER ? 'Bangkok Bank' : null,
              accountLast4: method === PaymentMethod.CREDIT_CARD ? '4242' : null,
              allocations: {
                create: {
                  invoiceId: invoice.id,
                  amount: paidAmount,
                },
              },
            },
          });

          allPayments.push(payment);
        }
      }
    }
  }

  console.log(`✅ Created ${allInvoices.length} invoices with line items`);
  console.log(`✅ Created ${allPayments.length} payments with allocations`);

  // ============================================================================
  // CREATE CREDIT NOTES
  // ============================================================================
  console.log('📝 Creating credit notes...');

  // Create credit notes directly to avoid any scoping issues
  const createCreditNote = async (
    memberIndex: number,
    cnType: CreditNoteType,
    cnReason: CreditNoteReason,
    description: string,
    amount: number,
  ) => {
    if (!adminUser || members.length <= memberIndex) return;

    creditNoteCounter++;
    const creditNoteNumber = `CN-${currentYear}-${String(creditNoteCounter).padStart(5, '0')}`;

    const existingCreditNote = await prisma.creditNote.findUnique({
      where: { clubId_creditNoteNumber: { clubId: club.id, creditNoteNumber } },
    });

    if (existingCreditNote) return;

    const member = members[memberIndex];
    const subtotal = amount;
    const taxAmount = Math.round(subtotal * 0.07);
    const totalAmount = subtotal + taxAmount;

    await prisma.creditNote.create({
      data: {
        clubId: club.id,
        memberId: member.id,
        creditNoteNumber,
        issueDate: new Date(),
        type: cnType,
        reason: cnReason,
        reasonDetail: description,
        subtotal,
        taxAmount,
        totalAmount,
        appliedToBalance: 0,
        refundedAmount: 0,
        status: CreditNoteStatus.APPROVED,
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        createdBy: adminUser.id,
        lineItems: {
          create: [
            {
              description,
              quantity: 1,
              unitPrice: subtotal,
              lineTotal: subtotal,
              taxable: true,
              taxRate: 7,
              taxAmount,
            },
          ],
        },
      },
    });
  };

  await createCreditNote(2, CreditNoteType.ADJUSTMENT, CreditNoteReason.BILLING_ERROR, 'Duplicate charge correction', 2500);
  await createCreditNote(5, CreditNoteType.REFUND, CreditNoteReason.RAIN_CHECK, 'Partial refund - course closure due to weather', 1500);
  await createCreditNote(8, CreditNoteType.ADJUSTMENT, CreditNoteReason.PRICE_ADJUSTMENT, 'Pro-rated adjustment for membership upgrade', 5000);

  console.log('✅ Created credit notes');

  // ============================================================================
  // CREATE AGING SUMMARY DATA
  // ============================================================================
  console.log('📊 Creating aging summary...');

  // Update some invoices to be overdue with specific aging buckets
  const overdueScenarios = [
    { memberIndex: 10, daysOverdue: 15, amount: 18500 }, // 1-30 days
    { memberIndex: 11, daysOverdue: 45, amount: 22000 }, // 31-60 days
    { memberIndex: 12, daysOverdue: 75, amount: 35000 }, // 61-90 days
    { memberIndex: 13, daysOverdue: 120, amount: 45000 }, // 90+ days
  ];

  for (const scenario of overdueScenarios) {
    if (members.length <= scenario.memberIndex) continue;

    const member = members[scenario.memberIndex];
    invoiceCounter++;

    const invoiceNumber = `INV-${currentYear}-${String(invoiceCounter).padStart(5, '0')}`;
    const dueDate = new Date(now.getTime() - scenario.daysOverdue * 24 * 60 * 60 * 1000);
    const invoiceDate = new Date(dueDate.getTime() - 5 * 24 * 60 * 60 * 1000);

    const existingInvoice = await prisma.invoice.findUnique({
      where: { clubId_invoiceNumber: { clubId: club.id, invoiceNumber } },
    });

    if (!existingInvoice) {
      const monthlyFeeType = chargeTypeMap.get('MONTHLY_FEE');
      const subtotal = Math.round(scenario.amount / 1.07);
      const taxAmount = scenario.amount - subtotal;

      await prisma.invoice.create({
        data: {
          clubId: club.id,
          memberId: member.id,
          invoiceNumber,
          invoiceDate,
          dueDate,
          billingPeriod: `Overdue - ${scenario.daysOverdue} days`,
          subtotal,
          taxAmount,
          discountAmount: 0,
          totalAmount: scenario.amount,
          paidAmount: 0,
          balanceDue: scenario.amount,
          status: InvoiceStatus.OVERDUE,
          sentAt: invoiceDate,
          lineItems: {
            create: [
              {
                chargeTypeId: monthlyFeeType?.id,
                description: `Outstanding Balance - ${scenario.daysOverdue} days overdue`,
                quantity: 1,
                unitPrice: subtotal,
                lineTotal: subtotal,
                discountPct: 0,
                taxType: 'VAT',
                taxRate: 7,
                sortOrder: 0,
              },
            ],
          },
        },
      });
    }
  }

  console.log('✅ Created aging summary invoices');

  // ============================================================================
  // CREATE CITY LEDGER ACCOUNTS
  // ============================================================================
  console.log('🏢 Creating City Ledger accounts...');

  const cityLedgerAccounts = [
    // 3 Corporate accounts
    {
      accountNumber: 'CL-CORP-001',
      accountName: 'Bangkok Executive Group Co., Ltd.',
      accountType: CityLedgerType.CORPORATE,
      contactName: 'Khun Somchai Prasert',
      contactEmail: 'somchai@bkk-exec.co.th',
      contactPhone: '02-123-4567',
      billingAddress: '123 Sukhumvit Road, Klongtoey, Bangkok 10110',
      taxId: '0105559012345',
      creditLimit: 500000,
      paymentTerms: 30,
      notes: 'Premium corporate member - quarterly golf events',
    },
    {
      accountNumber: 'CL-CORP-002',
      accountName: 'Siam Pacific Holdings',
      accountType: CityLedgerType.CORPORATE,
      contactName: 'Khun Naree Wongchai',
      contactEmail: 'naree.w@siampacific.com',
      contactPhone: '02-987-6543',
      billingAddress: '456 Silom Road, Bangrak, Bangkok 10500',
      taxId: '0105560078901',
      creditLimit: 300000,
      paymentTerms: 30,
      notes: 'New corporate account - joined Q4 2025',
    },
    {
      accountNumber: 'CL-CORP-003',
      accountName: 'Thai International Trading',
      accountType: CityLedgerType.CORPORATE,
      contactName: 'Khun Prasit Tongchai',
      contactEmail: 'prasit@tit-trade.com',
      contactPhone: '02-555-8888',
      billingAddress: '789 Rama IV Road, Sathorn, Bangkok 10120',
      taxId: '0105558034567',
      creditLimit: 200000,
      paymentTerms: 45,
      notes: 'Monthly team building events',
    },
    // 2 House accounts
    {
      accountNumber: 'CL-HOUSE-001',
      accountName: 'Pro Shop Inventory',
      accountType: CityLedgerType.HOUSE,
      contactName: 'Golf Operations Manager',
      contactEmail: 'proshop@royalbangkokclub.com',
      contactPhone: '02-111-2222',
      billingAddress: 'Royal Bangkok Club - Pro Shop',
      creditLimit: 100000,
      paymentTerms: 0,
      notes: 'Internal pro shop inventory and supplies',
    },
    {
      accountNumber: 'CL-HOUSE-002',
      accountName: 'Member Events & Tournaments',
      accountType: CityLedgerType.HOUSE,
      contactName: 'Events Coordinator',
      contactEmail: 'events@royalbangkokclub.com',
      contactPhone: '02-111-3333',
      billingAddress: 'Royal Bangkok Club - Events Office',
      creditLimit: 250000,
      paymentTerms: 0,
      notes: 'Tournament sponsorships and event expenses',
    },
    // 1 Vendor account
    {
      accountNumber: 'CL-VEND-001',
      accountName: 'Green Valley Golf Supplies',
      accountType: CityLedgerType.VENDOR,
      contactName: 'Khun Wichai Greenfield',
      contactEmail: 'sales@greenvalleygolf.com',
      contactPhone: '02-444-5555',
      billingAddress: '321 Industrial Ring Road, Samut Prakan 10280',
      taxId: '0105557098765',
      creditLimit: 150000,
      paymentTerms: 60,
      notes: 'Primary golf equipment and supplies vendor - credit arrangement',
    },
  ];

  const createdCityLedgers: any[] = [];

  for (const clData of cityLedgerAccounts) {
    const existingCL = await prisma.cityLedger.findUnique({
      where: { clubId_accountNumber: { clubId: club.id, accountNumber: clData.accountNumber } },
    });

    if (existingCL) {
      createdCityLedgers.push(existingCL);
      continue;
    }

    const cityLedger = await prisma.cityLedger.create({
      data: {
        clubId: club.id,
        ...clData,
        status: CityLedgerStatus.ACTIVE,
        creditBalance: 0,
        outstandingBalance: 0,
      },
    });

    createdCityLedgers.push(cityLedger);
  }

  console.log(`✅ Created ${createdCityLedgers.length} City Ledger accounts`);

  // ============================================================================
  // CREATE CITY LEDGER INVOICES
  // ============================================================================
  console.log('📄 Creating City Ledger invoices...');

  let clInvoiceCounter = 500; // Start at 500 for CL invoices
  let clPaymentCounter = 500;

  // Invoice scenarios for City Ledger accounts
  const clInvoiceScenarios = [
    // Bangkok Executive Group - large corporate with mixed payment status
    { clIndex: 0, daysAgo: 60, amount: 125000, status: InvoiceStatus.PAID, desc: 'Q4 Corporate Golf Tournament' },
    { clIndex: 0, daysAgo: 30, amount: 85000, status: InvoiceStatus.PAID, desc: 'December Team Building Event' },
    { clIndex: 0, daysAgo: 15, amount: 95000, status: InvoiceStatus.PARTIALLY_PAID, paidPct: 0.5, desc: 'January Executive Golf Day' },
    { clIndex: 0, daysAgo: 5, amount: 45000, status: InvoiceStatus.SENT, desc: 'Conference Room Rental' },

    // Siam Pacific Holdings - newer account, some unpaid
    { clIndex: 1, daysAgo: 45, amount: 55000, status: InvoiceStatus.PAID, desc: 'Corporate Membership Initiation' },
    { clIndex: 1, daysAgo: 20, amount: 38000, status: InvoiceStatus.OVERDUE, desc: 'Golf & Dinner Package' },
    { clIndex: 1, daysAgo: 3, amount: 22000, status: InvoiceStatus.SENT, desc: 'February Event Deposit' },

    // Thai International Trading - regular monthly events
    { clIndex: 2, daysAgo: 75, amount: 42000, status: InvoiceStatus.PAID, desc: 'November Team Building' },
    { clIndex: 2, daysAgo: 45, amount: 48000, status: InvoiceStatus.PAID, desc: 'December Team Building' },
    { clIndex: 2, daysAgo: 15, amount: 52000, status: InvoiceStatus.SENT, desc: 'January Team Building' },

    // Pro Shop Inventory - house account
    { clIndex: 3, daysAgo: 30, amount: 28000, status: InvoiceStatus.PAID, desc: 'Golf Equipment Restock' },
    { clIndex: 3, daysAgo: 7, amount: 15000, status: InvoiceStatus.SENT, desc: 'Pro Shop Supplies' },

    // Member Events - house account with larger amounts
    { clIndex: 4, daysAgo: 60, amount: 180000, status: InvoiceStatus.PAID, desc: 'Annual Championship Tournament' },
    { clIndex: 4, daysAgo: 25, amount: 75000, status: InvoiceStatus.PARTIALLY_PAID, paidPct: 0.6, desc: 'New Year Gala Expenses' },
    { clIndex: 4, daysAgo: 10, amount: 45000, status: InvoiceStatus.SENT, desc: 'Valentines Day Event Setup' },

    // Green Valley - vendor credits (shown as invoices to track receivables)
    { clIndex: 5, daysAgo: 90, amount: 65000, status: InvoiceStatus.PAID, desc: 'Equipment Trade-in Credit' },
    { clIndex: 5, daysAgo: 30, amount: 35000, status: InvoiceStatus.SENT, desc: 'Demo Equipment Return Credit' },
  ];

  let totalCLOutstanding = 0;

  for (const scenario of clInvoiceScenarios) {
    const cityLedger = createdCityLedgers[scenario.clIndex];
    if (!cityLedger) continue;

    clInvoiceCounter++;
    const invoiceNumber = `INV-CL-${currentYear}-${String(clInvoiceCounter).padStart(4, '0')}`;

    const existingInvoice = await prisma.invoice.findUnique({
      where: { clubId_invoiceNumber: { clubId: club.id, invoiceNumber } },
    });

    if (existingInvoice) continue;

    const invoiceDate = new Date(now.getTime() - scenario.daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(invoiceDate.getTime() + cityLedger.paymentTerms * 24 * 60 * 60 * 1000);

    const subtotal = Math.round(scenario.amount / 1.07);
    const taxAmount = scenario.amount - subtotal;

    let paidAmount = 0;
    if (scenario.status === InvoiceStatus.PAID) {
      paidAmount = scenario.amount;
    } else if (scenario.status === InvoiceStatus.PARTIALLY_PAID && scenario.paidPct) {
      paidAmount = Math.round(scenario.amount * scenario.paidPct);
    }

    const balanceDue = scenario.amount - paidAmount;
    if (balanceDue > 0) {
      totalCLOutstanding += balanceDue;
    }

    const invoice = await prisma.invoice.create({
      data: {
        clubId: club.id,
        cityLedgerId: cityLedger.id,
        invoiceNumber,
        invoiceDate,
        dueDate,
        billingPeriod: invoiceDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount: scenario.amount,
        paidAmount,
        balanceDue,
        status: scenario.status,
        sentAt: scenario.status !== InvoiceStatus.DRAFT ? invoiceDate : null,
        paidDate: scenario.status === InvoiceStatus.PAID ? dueDate : null,
        notes: `City Ledger: ${cityLedger.accountName}`,
        lineItems: {
          create: [
            {
              description: scenario.desc,
              quantity: 1,
              unitPrice: subtotal,
              lineTotal: subtotal,
              discountPct: 0,
              taxType: 'VAT',
              taxRate: 7,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // Create payment for paid/partially paid invoices
    if (paidAmount > 0) {
      clPaymentCounter++;
      const receiptNumber = `RCP-CL-${currentYear}-${String(clPaymentCounter).padStart(4, '0')}`;

      const existingPayment = await prisma.payment.findUnique({
        where: { clubId_receiptNumber: { clubId: club.id, receiptNumber } },
      });

      if (!existingPayment) {
        const paymentDate = scenario.status === InvoiceStatus.PAID
          ? new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000);

        await prisma.payment.create({
          data: {
            clubId: club.id,
            cityLedgerId: cityLedger.id,
            receiptNumber,
            amount: paidAmount,
            method: PaymentMethod.BANK_TRANSFER,
            paymentDate,
            referenceNumber: `TRF-CL-${Date.now()}-${clPaymentCounter}`,
            bankName: 'Bangkok Bank',
            notes: `Payment for ${invoiceNumber}`,
            allocations: {
              create: {
                invoiceId: invoice.id,
                amount: paidAmount,
              },
            },
          },
        });
      }
    }
  }

  // Update City Ledger outstanding balances
  for (const cityLedger of createdCityLedgers) {
    const outstanding = await prisma.invoice.aggregate({
      where: {
        cityLedgerId: cityLedger.id,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
      },
      _sum: { balanceDue: true },
    });

    await prisma.cityLedger.update({
      where: { id: cityLedger.id },
      data: {
        outstandingBalance: outstanding._sum.balanceDue || 0,
      },
    });
  }

  console.log(`✅ Created City Ledger invoices with ฿${totalCLOutstanding.toLocaleString()} outstanding`);

  // ============================================================================
  // CLUB BILLING SETTINGS
  // ============================================================================
  console.log('\n⚙️  Creating club billing settings...');

  // Check if settings already exist
  const existingSettings = await prisma.clubBillingSettings.findUnique({
    where: { clubId: club.id },
  });

  if (!existingSettings) {
    await prisma.clubBillingSettings.create({
      data: {
        clubId: club.id,
        defaultFrequency: 'MONTHLY',
        defaultTiming: 'ADVANCE',
        defaultAlignment: 'CALENDAR',
        defaultBillingDay: 1,
        invoiceGenerationLead: 5,
        invoiceDueDays: 15,
        gracePeriodDays: 15,
        lateFeeType: 'PERCENTAGE',
        lateFeeAmount: 0,
        lateFeePercentage: 1.5,
        maxLateFee: 5000,
        autoApplyLateFee: true,
        prorateNewMembers: true,
        prorateChanges: true,
        prorationMethod: 'DAILY',
      },
    });
    console.log('✅ Created club billing settings');
  } else {
    console.log('ℹ️  Club billing settings already exist, skipping...');
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  const totalInvoices = await prisma.invoice.count({ where: { clubId: club.id } });
  const totalPayments = await prisma.payment.count({ where: { clubId: club.id } });
  const totalCreditNotes = await prisma.creditNote.count({ where: { clubId: club.id } });
  const totalCityLedgers = await prisma.cityLedger.count({ where: { clubId: club.id } });
  const totalLineItems = await prisma.invoiceLineItem.count({
    where: { invoice: { clubId: club.id } },
  });

  // Count invoices by account type
  const memberInvoices = await prisma.invoice.count({
    where: { clubId: club.id, memberId: { not: null } },
  });
  const cityLedgerInvoices = await prisma.invoice.count({
    where: { clubId: club.id, cityLedgerId: { not: null } },
  });

  console.log('\n📈 Billing Data Summary:');
  console.log(`   Total Invoices: ${totalInvoices}`);
  console.log(`      - Member Invoices: ${memberInvoices}`);
  console.log(`      - City Ledger Invoices: ${cityLedgerInvoices}`);
  console.log(`   Total Line Items: ${totalLineItems}`);
  console.log(`   Total Payments: ${totalPayments}`);
  console.log(`   Total Credit Notes: ${totalCreditNotes}`);
  console.log(`   Total City Ledger Accounts: ${totalCityLedgers}`);

  // Calculate AR summary
  const arSummary = await prisma.invoice.aggregate({
    where: {
      clubId: club.id,
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
    },
    _sum: { balanceDue: true },
  });

  // Member AR
  const memberArSummary = await prisma.invoice.aggregate({
    where: {
      clubId: club.id,
      memberId: { not: null },
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
    },
    _sum: { balanceDue: true },
  });

  // City Ledger AR
  const cityLedgerArSummary = await prisma.invoice.aggregate({
    where: {
      clubId: club.id,
      cityLedgerId: { not: null },
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
    },
    _sum: { balanceDue: true },
  });

  console.log(`   Total Outstanding AR: ฿${arSummary._sum.balanceDue?.toNumber().toLocaleString() || 0}`);
  console.log(`      - Member AR: ฿${memberArSummary._sum.balanceDue?.toNumber().toLocaleString() || 0}`);
  console.log(`      - City Ledger AR: ฿${cityLedgerArSummary._sum.balanceDue?.toNumber().toLocaleString() || 0}`);

  console.log('\n✨ Billing seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
