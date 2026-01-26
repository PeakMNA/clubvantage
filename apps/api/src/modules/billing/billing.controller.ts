import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  InvoiceQueryDto,
} from './dto';
import { CurrentUser, CurrentTenant } from '@/common/decorators';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { Audit } from '@/common/decorators/audit.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Billing')
@ApiBearerAuth('JWT-auth')
@Controller({ version: '1' })
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ==================== INVOICES ====================

  @Post('invoices')
  @RequirePermissions('billing.invoices.create')
  @Audit({ action: 'CREATE', entityType: 'Invoice' })
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  async createInvoice(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.billingService.createInvoice(tenantId, dto, user.sub, user.email);
  }

  @Get('invoices')
  @RequirePermissions('billing.invoices.read')
  @ApiOperation({ summary: 'List invoices with filters' })
  @ApiResponse({ status: 200, description: 'Invoices list' })
  async findAllInvoices(
    @CurrentTenant() tenantId: string,
    @Query() query: InvoiceQueryDto,
  ) {
    return this.billingService.findAllInvoices(tenantId, query);
  }

  @Get('invoices/:id')
  @RequirePermissions('billing.invoices.read')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findInvoice(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.billingService.findInvoice(tenantId, id);
  }

  @Post('invoices/:id/send')
  @RequirePermissions('billing.invoices.send')
  @Audit({
    action: 'SEND',
    entityType: 'Invoice',
    getEntityId: (req) => req.params.id,
  })
  @ApiOperation({ summary: 'Send invoice to member' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice sent' })
  async sendInvoice(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.billingService.sendInvoice(tenantId, id, user.sub, user.email);
  }

  @Post('invoices/:id/void')
  @RequirePermissions('billing.invoices.void')
  @Audit({
    action: 'VOID',
    entityType: 'Invoice',
    getEntityId: (req) => req.params.id,
  })
  @ApiOperation({ summary: 'Void an invoice' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice voided' })
  async voidInvoice(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.billingService.voidInvoice(
      tenantId,
      id,
      reason,
      user.sub,
      user.email,
    );
  }

  // ==================== PAYMENTS ====================

  @Post('payments')
  @RequirePermissions('billing.payments.create')
  @Audit({ action: 'CREATE', entityType: 'Payment' })
  @ApiOperation({ summary: 'Record a payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded' })
  async createPayment(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.billingService.createPayment(tenantId, dto, user.sub, user.email);
  }

  @Get('payments')
  @RequirePermissions('billing.payments.read')
  @ApiOperation({ summary: 'List payments' })
  @ApiResponse({ status: 200, description: 'Payments list' })
  async findAllPayments(
    @CurrentTenant() tenantId: string,
    @Query('memberId') memberId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.findAllPayments(tenantId, { memberId, page, limit });
  }

  @Get('payments/:id')
  @RequirePermissions('billing.payments.read')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findPayment(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.billingService.findPayment(tenantId, id);
  }

  // ==================== STATISTICS ====================

  @Get('billing/stats')
  @RequirePermissions('billing.read')
  @ApiOperation({ summary: 'Get billing statistics' })
  @ApiResponse({ status: 200, description: 'Billing stats' })
  async getBillingStats(@CurrentTenant() tenantId: string) {
    return this.billingService.getBillingStats(tenantId);
  }
}
