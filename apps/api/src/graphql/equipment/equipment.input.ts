import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  EquipmentAttachmentType,
  EquipmentCondition,
  EquipmentStatus,
} from '@prisma/client';

// Category Inputs
@InputType()
export class CreateEquipmentCategoryInput {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => EquipmentAttachmentType, { nullable: true })
  attachmentType?: EquipmentAttachmentType;

  @Field(() => Float, { nullable: true })
  defaultRentalRate?: number;

  @Field({ nullable: true })
  requiresDeposit?: boolean;

  @Field(() => Float, { nullable: true })
  depositAmount?: number;
}

@InputType()
export class UpdateEquipmentCategoryInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => EquipmentAttachmentType, { nullable: true })
  attachmentType?: EquipmentAttachmentType;

  @Field(() => Float, { nullable: true })
  defaultRentalRate?: number;

  @Field({ nullable: true })
  requiresDeposit?: boolean;

  @Field(() => Float, { nullable: true })
  depositAmount?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

// Equipment Inputs
@InputType()
export class CreateEquipmentInput {
  @Field(() => ID)
  categoryId: string;

  @Field()
  assetNumber: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field({ nullable: true })
  warrantyExpiry?: Date;

  @Field(() => EquipmentCondition, { nullable: true })
  condition?: EquipmentCondition;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateEquipmentInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field({ nullable: true })
  warrantyExpiry?: Date;

  @Field(() => EquipmentCondition, { nullable: true })
  condition?: EquipmentCondition;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  lastMaintenanceAt?: Date;

  @Field({ nullable: true })
  nextMaintenanceAt?: Date;
}

@InputType()
export class UpdateEquipmentStatusInput {
  @Field(() => ID)
  id: string;

  @Field(() => EquipmentStatus)
  status: EquipmentStatus;
}

// Filter Inputs
@InputType()
export class EquipmentFilterInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => EquipmentStatus, { nullable: true })
  status?: EquipmentStatus;

  @Field(() => EquipmentCondition, { nullable: true })
  condition?: EquipmentCondition;
}

// Assignment Inputs
@InputType()
export class AssignEquipmentInput {
  @Field(() => ID)
  equipmentId: string;

  @Field(() => ID, { nullable: true })
  bookingId?: string;

  @Field(() => ID, { nullable: true })
  teeTimePlayerId?: string;

  @Field(() => Float, { nullable: true })
  rentalFee?: number;

  @Field(() => EquipmentCondition, { nullable: true })
  conditionAtCheckout?: EquipmentCondition;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class ReturnEquipmentInput {
  @Field(() => ID)
  assignmentId: string;

  @Field(() => EquipmentCondition)
  conditionAtReturn: EquipmentCondition;

  @Field({ nullable: true })
  notes?: string;
}

// Availability Query Args
@InputType()
export class EquipmentAvailabilityInput {
  @Field(() => ID)
  categoryId: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;
}
