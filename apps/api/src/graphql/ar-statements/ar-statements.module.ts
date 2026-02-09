import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { BillingModule } from '@/modules/billing/billing.module';

import { ARStatementsResolver } from './ar-statements.resolver';
import { ARProfileService } from './ar-profile.service';
import { StatementPeriodService } from './statement-period.service';
import { StatementRunService } from './statement-run.service';
import { StatementService } from './statement.service';
import { CloseChecklistService } from './close-checklist.service';

@Module({
  imports: [PrismaModule, forwardRef(() => BillingModule)],
  providers: [
    ARStatementsResolver,
    ARProfileService,
    StatementPeriodService,
    StatementRunService,
    StatementService,
    CloseChecklistService,
  ],
  exports: [
    ARProfileService,
    StatementPeriodService,
    StatementRunService,
    StatementService,
    CloseChecklistService,
  ],
})
export class ARStatementsModule {}
