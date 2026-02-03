import { EquipmentAttachmentType } from '@prisma/client';

export class CreateEquipmentCategoryDto {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  attachmentType?: EquipmentAttachmentType;
  defaultRentalRate?: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
}

export class UpdateEquipmentCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  attachmentType?: EquipmentAttachmentType;
  defaultRentalRate?: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
  isActive?: boolean;
  sortOrder?: number;
}
