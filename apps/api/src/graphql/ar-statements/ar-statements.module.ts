import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

import { ARStatementsResolver } from './ar-statements.resolver';
import { ARProfileService } from './ar-profile.service';
import { StatementPeriodService } from './statement-period.service';
import { StatementRunService } from './statement-run.service';
import { StatementService } from './statement.service';

@Module({
  imports: [PrismaModule],
  providers: [
    ARStatementsResolver,
    ARProfileService,
    StatementPeriodService,
    StatementRunService,
    StatementService,
  ],
  exports: [
    ARProfileService,
    StatementPeriodService,
    StatementRunService,
    StatementService,
  ],
})
export class ARStatementsModule {}
