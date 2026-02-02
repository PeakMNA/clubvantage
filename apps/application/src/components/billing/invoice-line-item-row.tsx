'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui';

interface ChargeType {
  id: string;
  name: string;
  code: string;
  defaultPrice?: number;
  taxable: boolean;
  taxRate?: number;
}

interface LineItemData {
  id: string;
  chargeTypeId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  taxRate: number;
}

interface InvoiceLineItemRowProps {
  item: LineItemData;
  chargeTypes: ChargeType[];
  onChange: (item: LineItemData) => void;
  onRemove: () => void;
  isOnly: boolean;
}

export function InvoiceLineItemRow({
  item,
  chargeTypes,
  onChange,
  onRemove,
  isOnly,
}: InvoiceLineItemRowProps) {
  const handleChargeTypeChange = (chargeTypeId: string) => {
    const chargeType = chargeTypes.find((ct) => ct.id === chargeTypeId);
    if (chargeType) {
      onChange({
        ...item,
        chargeTypeId,
        description: chargeType.name,
        unitPrice: chargeType.defaultPrice ?? item.unitPrice,
        taxable: chargeType.taxable,
        taxRate: chargeType.taxRate ?? 0,
      });
    }
  };

  const lineTotal = item.quantity * item.unitPrice;
  const taxAmount = item.taxable ? lineTotal * (item.taxRate / 100) : 0;

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-stone-100">
      {/* Charge Type */}
      <div className="col-span-3">
        <Select value={item.chargeTypeId} onValueChange={handleChargeTypeChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select charge type" />
          </SelectTrigger>
          <SelectContent>
            {chargeTypes.map((ct) => (
              <SelectItem key={ct.id} value={ct.id}>
                {ct.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="col-span-3">
        <Input
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          placeholder="Description"
          className="h-9"
        />
      </div>

      {/* Quantity */}
      <div className="col-span-1">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onChange({ ...item, quantity: Number(e.target.value) || 1 })}
          className="h-9 text-right"
        />
      </div>

      {/* Unit Price */}
      <div className="col-span-2">
        <Input
          type="number"
          step="0.01"
          value={item.unitPrice}
          onChange={(e) => onChange({ ...item, unitPrice: Number(e.target.value) || 0 })}
          className="h-9 text-right"
        />
      </div>

      {/* Tax */}
      <div className="col-span-1 text-right text-sm text-stone-500">
        {item.taxable ? `${item.taxRate}%` : '-'}
      </div>

      {/* Line Total */}
      <div className="col-span-1 text-right font-medium">
        ฿{(lineTotal + taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>

      {/* Remove */}
      <div className="col-span-1 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={isOnly}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-stone-400" />
        </Button>
      </div>
    </div>
  );
}

export type { ChargeType, LineItemData };
