'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '@clubvantage/ui';
import { Badge } from '@clubvantage/ui';
import { ContractSummaryCard } from './contract-summary-card';
import { ChargeCard } from './charge-card';
import { ContractEmpty } from './empty-states';
import type { Member, MembershipType, Charge } from './types';

interface ContractTabProps {
  member: Member;
  membershipType?: MembershipType;
  onAddCharge?: () => void;
  onEditCharge?: (charge: Charge) => void;
  onSuspendCharge?: (charge: Charge) => void;
  onResumeCharge?: (charge: Charge) => void;
  onRemoveCharge?: (charge: Charge) => void;
  onEndContract?: () => void;
  onResumeContract?: () => void;
  onCreateContract?: () => void;
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
  onCreateContract,
}: ContractTabProps) {
  const [isRecurringExpanded, setIsRecurringExpanded] = useState(true);
  const [isUsageExpanded, setIsUsageExpanded] = useState(true);

  const contract = member.contract;

  // No contract state
  if (!contract) {
    return <ContractEmpty onCreateContract={onCreateContract ?? (() => {})} />;
  }

  // Split charges by type
  const recurringCharges = contract.charges.filter((c) => c.chargeType === 'RECURRING');
  const usageCharges = contract.charges.filter((c) => c.chargeType === 'USAGE_BASED');

  // Calculate monthly estimate
  const monthlyEstimate = recurringCharges
    .filter((c) => c.status === 'ACTIVE')
    .reduce((sum, charge) => {
      // Convert to monthly based on frequency
      const monthlyAmount =
        charge.frequency === 'QUARTERLY'
          ? charge.amount / 3
          : charge.frequency === 'SEMI_ANNUAL'
            ? charge.amount / 6
            : charge.frequency === 'ANNUAL'
              ? charge.amount / 12
              : charge.amount;
      return sum + monthlyAmount;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Contract Summary */}
      <ContractSummaryCard
        status={contract.status}
        membershipTypeName={member.membershipTypeName}
        startDate={contract.startDate}
        endDate={contract.endDate}
        monthlyEstimate={monthlyEstimate}
        onEndContract={contract.status === 'ACTIVE' ? onEndContract : undefined}
        onResumeContract={contract.status === 'SUSPENDED' ? onResumeContract : undefined}
      />

      {/* Recurring Charges Section */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <button
            type="button"
            onClick={() => setIsRecurringExpanded(!isRecurringExpanded)}
            className="flex flex-1 items-center gap-3"
          >
            <h3 className="text-base font-semibold text-foreground">Recurring Charges</h3>
            <Badge variant="secondary" className="text-xs">
              {recurringCharges.length}
            </Badge>
            {isRecurringExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddCharge?.()}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {isRecurringExpanded && (
          <div className="border-t border-border p-4">
            {recurringCharges.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No recurring charges
              </div>
            ) : (
              <div className="space-y-3">
                {recurringCharges.map((charge) => (
                  <ChargeCard
                    key={charge.id}
                    charge={charge}
                    onEdit={() => onEditCharge?.(charge)}
                    onSuspend={() => onSuspendCharge?.(charge)}
                    onResume={() => onResumeCharge?.(charge)}
                    onRemove={() => onRemoveCharge?.(charge)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage-Based Charges Section */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <button
            type="button"
            onClick={() => setIsUsageExpanded(!isUsageExpanded)}
            className="flex flex-1 items-center gap-3"
          >
            <h3 className="text-base font-semibold text-foreground">Usage-Based Charges</h3>
            <Badge variant="secondary" className="text-xs">
              {usageCharges.length}
            </Badge>
            {isUsageExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddCharge?.()}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {isUsageExpanded && (
          <div className="border-t border-border p-4">
            {usageCharges.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No usage-based charges
              </div>
            ) : (
              <div className="space-y-3">
                {usageCharges.map((charge) => (
                  <ChargeCard
                    key={charge.id}
                    charge={charge}
                    onEdit={() => onEditCharge?.(charge)}
                    onSuspend={() => onSuspendCharge?.(charge)}
                    onResume={() => onResumeCharge?.(charge)}
                    onRemove={() => onRemoveCharge?.(charge)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
