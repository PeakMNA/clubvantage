'use client';

import { useState } from 'react';
import { Button, cn, Badge } from '@clubvantage/ui';
import { ContractSummaryCard } from '../contract-summary-card';
import { ChargeCard } from '../charge-card';
import { Member, Charge, MembershipType, ChargeType } from '../types';
import { Plus, ChevronDown, ChevronUp, FileText, RefreshCw, Zap } from 'lucide-react';

export interface ContractTabProps {
  member: Member;
  membershipType?: MembershipType;
  onAddCharge?: () => void;
  onEditCharge?: (charge: Charge) => void;
  onSuspendCharge?: (charge: Charge) => void;
  onResumeCharge?: (charge: Charge) => void;
  onRemoveCharge?: (charge: Charge) => void;
  onEndContract?: () => void;
  onResumeContract?: () => void;
}

interface ChargeSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  charges: Charge[];
  badgeColor: string;
  defaultExpanded?: boolean;
  onAddCharge?: () => void;
  onEdit?: (charge: Charge) => void;
  onSuspend?: (charge: Charge) => void;
  onResume?: (charge: Charge) => void;
  onRemove?: (charge: Charge) => void;
}

function ChargeSection({
  title,
  icon: Icon,
  charges,
  badgeColor,
  defaultExpanded = true,
  onAddCharge,
  onEdit,
  onSuspend,
  onResume,
  onRemove,
}: ChargeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-foreground sm:text-lg">{title}</h3>
            <Badge className={cn('text-[10px] font-semibold', badgeColor)}>
              {charges.length}
            </Badge>
          </div>
          <div className="ml-2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddCharge}
          className="border bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="relative p-4 sm:p-5">
          {charges.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">No {title.toLowerCase()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Add a charge to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {charges.map((charge) => (
                <ChargeCard
                  key={charge.id}
                  charge={charge}
                  onEdit={() => onEdit?.(charge)}
                  onSuspend={() => onSuspend?.(charge)}
                  onResume={() => onResume?.(charge)}
                  onRemove={() => onRemove?.(charge)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContractTab({
  member,
  membershipType,
  onAddCharge,
  onEditCharge,
  onSuspendCharge,
  onResumeCharge,
  onRemoveCharge,
  onEndContract,
  onResumeContract,
}: ContractTabProps) {
  const contract = member.contract;

  if (!contract) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
        <div className="relative flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">No Active Contract</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            This member doesn&apos;t have an active contract. Create one to add recurring and usage-based charges.
          </p>
          <Button className="mt-6 shadow-md" onClick={onAddCharge}>
            <Plus className="mr-2 h-4 w-4" />
            Create Contract
          </Button>
        </div>
      </div>
    );
  }

  const recurringCharges = contract.charges.filter(
    (c) => c.chargeType === 'RECURRING'
  );
  const usageCharges = contract.charges.filter(
    (c) => c.chargeType === 'USAGE_BASED'
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contract Summary */}
      <ContractSummaryCard
        status={contract.status}
        membershipTypeName={membershipType?.name || 'Unknown Membership'}
        startDate={contract.startDate}
        endDate={contract.endDate}
        monthlyEstimate={
          recurringCharges.reduce((sum, c) => {
            if (c.frequency === 'MONTHLY') return sum + c.amount;
            if (c.frequency === 'QUARTERLY') return sum + c.amount / 3;
            if (c.frequency === 'SEMI_ANNUAL') return sum + c.amount / 6;
            if (c.frequency === 'ANNUAL') return sum + c.amount / 12;
            return sum;
          }, 0)
        }
        onEndContract={onEndContract}
        onResumeContract={onResumeContract}
      />

      {/* Charge Sections */}
      <ChargeSection
        title="Recurring Charges"
        icon={RefreshCw}
        charges={recurringCharges}
        badgeColor="bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/30"
        onAddCharge={onAddCharge}
        onEdit={onEditCharge}
        onSuspend={onSuspendCharge}
        onResume={onResumeCharge}
        onRemove={onRemoveCharge}
      />

      <ChargeSection
        title="Usage-Based Charges"
        icon={Zap}
        charges={usageCharges}
        badgeColor="bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/30"
        onAddCharge={onAddCharge}
        onEdit={onEditCharge}
        onSuspend={onSuspendCharge}
        onResume={onResumeCharge}
        onRemove={onRemoveCharge}
      />

      {/* Empty State for all charges */}
      {contract.charges.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border bg-muted/50 p-8 text-center sm:p-12">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No charges configured</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add recurring or usage-based charges to this contract.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 border"
              onClick={onAddCharge}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add First Charge
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
