import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class PaymentArrangementService {
  private readonly logger = new Logger(PaymentArrangementService.name);

  constructor(private prisma: PrismaService) {}

  async createArrangement(
    tenantId: string,
    dto: {
      memberId: string;
      invoiceIds: string[];
      installmentCount: number;
      frequency: string;
      startDate: string;
      notes?: string;
    },
    userId: string,
  ) {
    // Validate invoices exist and belong to the member
    const invoices = await this.prisma.invoice.findMany({
      where: {
        id: { in: dto.invoiceIds },
        clubId: tenantId,
        memberId: dto.memberId,
        deletedAt: null,
      },
    });

    if (invoices.length !== dto.invoiceIds.length) {
      throw new BadRequestException('One or more invoices not found');
    }

    const totalAmount = invoices.reduce(
      (sum, inv) => sum + inv.balanceDue.toNumber(),
      0,
    );

    // Generate arrangement number
    const year = new Date().getFullYear();
    const prefix = `PA-${year}-`;
    const last = await this.prisma.paymentArrangement.findFirst({
      where: {
        clubId: tenantId,
        arrangementNumber: { startsWith: prefix },
      },
      orderBy: { arrangementNumber: 'desc' },
    });
    const nextNum = last
      ? parseInt(last.arrangementNumber.split('-').pop() || '0', 10) + 1
      : 1;
    const arrangementNumber = `${prefix}${nextNum.toString().padStart(5, '0')}`;

    // Calculate installment amounts and dates
    const installmentAmount = Math.floor((totalAmount / dto.installmentCount) * 100) / 100;
    const lastInstallmentAmount =
      totalAmount - installmentAmount * (dto.installmentCount - 1);

    const startDate = new Date(dto.startDate);
    const installments: Array<{
      installmentNo: number;
      dueDate: Date;
      amount: number;
    }> = [];

    for (let i = 0; i < dto.installmentCount; i++) {
      const dueDate = new Date(startDate);
      if (dto.frequency === 'WEEKLY') {
        dueDate.setDate(dueDate.getDate() + i * 7);
      } else if (dto.frequency === 'BIWEEKLY') {
        dueDate.setDate(dueDate.getDate() + i * 14);
      } else {
        dueDate.setMonth(dueDate.getMonth() + i);
      }

      installments.push({
        installmentNo: i + 1,
        dueDate,
        amount:
          i === dto.installmentCount - 1 ? lastInstallmentAmount : installmentAmount,
      });
    }

    const endDate = installments[installments.length - 1].dueDate;

    const arrangement = await this.prisma.paymentArrangement.create({
      data: {
        clubId: tenantId,
        memberId: dto.memberId,
        arrangementNumber,
        totalAmount,
        remainingAmount: totalAmount,
        installmentCount: dto.installmentCount,
        frequency: dto.frequency as any,
        startDate,
        endDate,
        status: 'DRAFT',
        notes: dto.notes,
        createdBy: userId,
        installments: {
          create: installments,
        },
        invoices: {
          create: dto.invoiceIds.map((invoiceId) => ({
            invoiceId,
          })),
        },
      },
      include: {
        member: true,
        installments: { orderBy: { installmentNo: 'asc' } },
        invoices: { include: { invoice: true } },
      },
    });

    return arrangement;
  }

  async getArrangements(
    tenantId: string,
    options: {
      memberId?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const where: any = { clubId: tenantId };
    if (options.memberId) where.memberId = options.memberId;
    if (options.status) where.status = options.status;

    const page = options.page || 1;
    const limit = options.limit || 20;

    const [arrangements, totalCount] = await Promise.all([
      this.prisma.paymentArrangement.findMany({
        where,
        include: {
          member: true,
          installments: { orderBy: { installmentNo: 'asc' } },
          invoices: { include: { invoice: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.paymentArrangement.count({ where }),
    ]);

    return { arrangements, totalCount };
  }

  async getArrangement(tenantId: string, id: string) {
    const arrangement = await this.prisma.paymentArrangement.findFirst({
      where: { id, clubId: tenantId },
      include: {
        member: true,
        installments: { orderBy: { installmentNo: 'asc' } },
        invoices: { include: { invoice: true } },
      },
    });

    if (!arrangement) {
      throw new NotFoundException('Payment arrangement not found');
    }

    return arrangement;
  }

  async recordInstallmentPayment(
    tenantId: string,
    arrangementId: string,
    installmentId: string,
    paymentId: string,
    amount: number,
    userId: string,
  ) {
    const arrangement = await this.getArrangement(tenantId, arrangementId);
    const installment = arrangement.installments.find(
      (i) => i.id === installmentId,
    );

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    if (installment.status === 'PAID') {
      throw new BadRequestException('Installment already paid');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update installment
      await tx.arrangementInstallment.update({
        where: { id: installmentId },
        data: {
          paidAmount: { increment: amount },
          status: 'PAID',
          paymentId,
          paidAt: new Date(),
        },
      });

      // Update arrangement totals
      const newPaidAmount = arrangement.paidAmount.toNumber() + amount;
      const newRemainingAmount = arrangement.totalAmount.toNumber() - newPaidAmount;

      const allInstallments = await tx.arrangementInstallment.findMany({
        where: { arrangementId },
      });
      const allPaid = allInstallments.every(
        (i) => i.id === installmentId || i.status === 'PAID' || i.status === 'WAIVED',
      );

      return tx.paymentArrangement.update({
        where: { id: arrangementId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: allPaid ? 'COMPLETED' : 'ACTIVE',
        },
        include: {
          member: true,
          installments: { orderBy: { installmentNo: 'asc' } },
          invoices: { include: { invoice: true } },
        },
      });
    });

    return result;
  }

  async cancelArrangement(tenantId: string, id: string, userId: string) {
    const arrangement = await this.getArrangement(tenantId, id);

    if (arrangement.status === 'COMPLETED' || arrangement.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot cancel a completed or already cancelled arrangement',
      );
    }

    return this.prisma.paymentArrangement.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        member: true,
        installments: { orderBy: { installmentNo: 'asc' } },
        invoices: { include: { invoice: true } },
      },
    });
  }

  async activateArrangement(tenantId: string, id: string, userId: string) {
    const arrangement = await this.getArrangement(tenantId, id);

    if (arrangement.status !== 'DRAFT') {
      throw new BadRequestException('Only draft arrangements can be activated');
    }

    return this.prisma.paymentArrangement.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        member: true,
        installments: { orderBy: { installmentNo: 'asc' } },
        invoices: { include: { invoice: true } },
      },
    });
  }
}
