import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsUUID, IsString, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import {
  EquipmentAttachmentType,
  EquipmentCondition,
  EquipmentStatus,
  OperationType,
} from '@prisma/client';

// Category Inputs
@InputType()
export class CreateEquipmentCategoryInput {
  @Field()
  @IsString()
  code: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => EquipmentAttachmentType, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentAttachmentType)
  attachmentType?: EquipmentAttachmentType;

  @Field(() => OperationType, { nullable: true, defaultValue: OperationType.FACILITY })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  defaultRentalRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;
}

@InputType()
export class UpdateEquipmentCategoryInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => EquipmentAttachmentType, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentAttachmentType)
  attachmentType?: EquipmentAttachmentType;

  @Field(() => OperationType, { nullable: true })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  defaultRentalRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// Equipment Inputs
@InputType()
export class CreateEquipmentInput {
  @Field(() => ID)
  @IsUUID()
  categoryId: string;

  @Field()
  @IsString()
  assetNumber: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchaseDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  warrantyExpiry?: Date;

  @Field(() => EquipmentCondition, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateEquipmentInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchaseDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  warrantyExpiry?: Date;

  @Field(() => EquipmentCondition, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastMaintenanceAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextMaintenanceAt?: Date;
}

@InputType()
export class UpdateEquipmentStatusInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => EquipmentStatus)
  @IsEnum(EquipmentStatus)
  status: EquipmentStatus;
}

// Filter Inputs
@InputType()
export class EquipmentCategoryFilterInput {
  @Field(() => OperationType, { nullable: true })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class EquipmentFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => EquipmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @Field(() => EquipmentCondition, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;

  @Field(() => OperationType, { nullable: true, description: 'Filter by category operation type' })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;
}

// Assignment Inputs
@InputType()
export class AssignEquipmentInput {
  @Field(() => ID)
  @IsUUID()
  equipmentId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  teeTimePlayerId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  rentalFee?: number;

  @Field(() => EquipmentCondition, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  conditionAtCheckout?: EquipmentCondition;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class ReturnEquipmentInput {
  @Field(() => ID)
  @IsUUID()
  assignmentId: string;

  @Field(() => EquipmentCondition, { nullable: true })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  conditionAtReturn?: EquipmentCondition;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Availability Query Args
@InputType()
export class EquipmentAvailabilityInput {
  @Field(() => ID)
  @IsUUID()
  categoryId: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  endTime: Date;
}
