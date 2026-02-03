import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import {
  EquipmentAttachmentType,
  EquipmentCondition,
  EquipmentStatus,
  OperationType,
} from '@prisma/client';

// Register enums
registerEnumType(EquipmentAttachmentType, {
  name: 'EquipmentAttachmentType',
  description: 'Type of equipment attachment to bookings',
});

registerEnumType(EquipmentCondition, {
  name: 'EquipmentCondition',
  description: 'Physical condition of equipment',
});

registerEnumType(EquipmentStatus, {
  name: 'EquipmentStatus',
  description: 'Availability status of equipment',
});

registerEnumType(OperationType, {
  name: 'OperationType',
  description: 'Type of operation this equipment category belongs to (Golf, Facility, Spa, Event)',
});

@ObjectType('EquipmentCategory', { description: 'Equipment category for grouping similar equipment types' })
export class EquipmentCategoryType {
  @Field(() => ID)
  id: string;

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

  @Field(() => EquipmentAttachmentType)
  attachmentType: EquipmentAttachmentType;

  @Field(() => OperationType)
  operationType: OperationType;

  @Field(() => Float, { nullable: true })
  defaultRentalRate?: number;

  @Field()
  requiresDeposit: boolean;

  @Field(() => Float, { nullable: true })
  depositAmount?: number;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  equipmentCount: number;

  @Field(() => Int)
  availableCount: number;
}

@ObjectType('EquipmentAssignmentMember', { description: 'Member info for equipment assignment' })
export class EquipmentAssignmentMemberType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@ObjectType('EquipmentAssignment', { description: 'Equipment assignment to a booking or tee time player' })
export class EquipmentAssignmentType {
  @Field(() => ID)
  id: string;

  @Field(() => EquipmentAssignmentMemberType, { nullable: true })
  member?: EquipmentAssignmentMemberType;

  @Field({ nullable: true })
  bookingNumber?: string;

  @Field()
  assignedAt: Date;

  @Field({ nullable: true })
  returnedAt?: Date;

  @Field(() => Float, { nullable: true })
  rentalFee?: number;

  @Field(() => EquipmentCondition, { nullable: true })
  conditionAtCheckout?: EquipmentCondition;

  @Field(() => EquipmentCondition, { nullable: true })
  conditionAtReturn?: EquipmentCondition;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType('Equipment', { description: 'Individual equipment item' })
export class EquipmentType {
  @Field(() => ID)
  id: string;

  @Field()
  assetNumber: string;

  @Field()
  name: string;

  @Field(() => EquipmentCategoryType)
  category: EquipmentCategoryType;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => EquipmentCondition)
  condition: EquipmentCondition;

  @Field(() => EquipmentStatus)
  status: EquipmentStatus;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field({ nullable: true })
  warrantyExpiry?: Date;

  @Field({ nullable: true })
  lastMaintenanceAt?: Date;

  @Field({ nullable: true })
  nextMaintenanceAt?: Date;

  @Field(() => EquipmentAssignmentType, { nullable: true })
  currentAssignment?: EquipmentAssignmentType;
}

// Response Types
@ObjectType('EquipmentCategoryResponse')
export class EquipmentCategoryResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => EquipmentCategoryType, { nullable: true })
  category?: EquipmentCategoryType;
}

@ObjectType('EquipmentResponse')
export class EquipmentResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => EquipmentType, { nullable: true })
  equipment?: EquipmentType;
}

@ObjectType('EquipmentAssignmentResponse')
export class EquipmentAssignmentResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => EquipmentAssignmentType, { nullable: true })
  assignment?: EquipmentAssignmentType;
}

@ObjectType('EquipmentDeleteResponse')
export class EquipmentDeleteResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType('EquipmentReleaseResponse')
export class EquipmentReleaseResponseType {
  @Field()
  success: boolean;

  @Field(() => Int)
  releasedCount: number;

  @Field({ nullable: true })
  error?: string;
}
