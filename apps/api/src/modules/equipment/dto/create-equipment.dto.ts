import { EquipmentCondition, EquipmentStatus } from '@prisma/client';

export class CreateEquipmentDto {
  categoryId: string;
  assetNumber: string;
  name: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  condition?: EquipmentCondition;
  location?: string;
  notes?: string;
}

export class UpdateEquipmentDto {
  name?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  condition?: EquipmentCondition;
  status?: EquipmentStatus;
  location?: string;
  notes?: string;
  lastMaintenanceAt?: Date;
  nextMaintenanceAt?: Date;
}
