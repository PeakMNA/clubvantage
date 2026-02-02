import { Field, ID, ObjectType, registerEnumType, Float } from '@nestjs/graphql';
import { CashDrawerStatus, CashMovementType } from '@prisma/client';

registerEnumType(CashDrawerStatus, {
  name: 'CashDrawerStatus',
  description: 'Status of a cash drawer shift',
});

registerEnumType(CashMovementType, {
  name: 'CashMovementType',
  description: 'Type of cash movement',
});

@ObjectType()
export class CashMovementGraphQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  shiftId: string;

  @Field(() => CashMovementType)
  type: CashMovementType;

  @Field(() => Float)
  amount: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => ID, { nullable: true })
  approvedBy?: string;

  @Field(() => ID, { nullable: true })
  transactionId?: string;

  @Field(() => ID)
  performedBy: string;

  @Field()
  performedAt: Date;
}

@ObjectType()
export class CashDrawerShiftGraphQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  cashDrawerId: string;

  @Field(() => CashDrawerStatus)
  status: CashDrawerStatus;

  @Field(() => ID)
  openedBy: string;

  @Field()
  openedAt: Date;

  @Field(() => Float)
  openingFloat: number;

  @Field({ nullable: true, description: 'JSON string of denomination counts' })
  openingDenominations?: string;

  @Field(() => ID, { nullable: true })
  closedBy?: string;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field(() => Float, { nullable: true })
  closingCount?: number;

  @Field({ nullable: true, description: 'JSON string of denomination counts' })
  closingDenominations?: string;

  @Field(() => Float, { nullable: true })
  expectedCash?: number;

  @Field(() => Float, { nullable: true })
  actualCash?: number;

  @Field(() => Float, { nullable: true })
  variance?: number;

  @Field({ nullable: true })
  varianceNote?: string;

  @Field(() => Float)
  totalSales: number;

  @Field(() => Float)
  totalRefunds: number;

  @Field(() => Float)
  totalPaidIn: number;

  @Field(() => Float)
  totalPaidOut: number;

  @Field(() => Float)
  totalDrops: number;

  @Field()
  createdAt: Date;

  @Field(() => [CashMovementGraphQLType], { nullable: true })
  movements?: CashMovementGraphQLType[];
}

@ObjectType()
export class CashDrawerGraphQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  clubId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => CashDrawerShiftGraphQLType, { nullable: true })
  currentShift?: CashDrawerShiftGraphQLType;
}

@ObjectType()
export class ShiftSummaryGraphQLType {
  @Field(() => ID)
  shiftId: string;

  @Field(() => CashDrawerStatus)
  status: CashDrawerStatus;

  @Field()
  openedAt: Date;

  @Field(() => ID)
  openedBy: string;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field(() => ID, { nullable: true })
  closedBy?: string;

  @Field(() => Float)
  openingFloat: number;

  @Field(() => Float, { nullable: true })
  closingCount?: number;

  @Field(() => Float)
  expectedCash: number;

  @Field(() => Float, { nullable: true })
  actualCash?: number;

  @Field(() => Float, { nullable: true })
  variance?: number;

  @Field(() => Float)
  totalSales: number;

  @Field(() => Float)
  totalRefunds: number;

  @Field(() => Float)
  totalPaidIn: number;

  @Field(() => Float)
  totalPaidOut: number;

  @Field(() => Float)
  totalDrops: number;

  @Field()
  movementCount: number;
}

@ObjectType()
export class DenominationCountGraphQLType {
  @Field(() => Float)
  denomination: number;

  @Field()
  count: number;

  @Field(() => Float)
  total: number;
}
