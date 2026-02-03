import { EquipmentCondition } from '@prisma/client';

export class AssignEquipmentDto {
  equipmentId: string;
  bookingId?: string;
  teeTimePlayerId?: string;
  rentalFee?: number;
  conditionAtCheckout?: EquipmentCondition;
  notes?: string;
}

export class ReturnEquipmentDto {
  conditionAtReturn?: EquipmentCondition;
  notes?: string;
}
