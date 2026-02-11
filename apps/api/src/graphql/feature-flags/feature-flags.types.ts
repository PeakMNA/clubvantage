import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ModuleFlagsType {
  @Field()
  golf: boolean;

  @Field()
  bookings: boolean;

  @Field()
  billing: boolean;

  @Field()
  marketing: boolean;

  @Field()
  pos: boolean;

  @Field()
  reports: boolean;
}

@ObjectType()
export class FeatureLevelFlagsType {
  @Field()
  golfLottery: boolean;

  @Field()
  memberWindows: boolean;

  @Field()
  aiDynamicPricing: boolean;

  @Field()
  automatedFlows: boolean;

  @Field()
  memberPricing: boolean;

  @Field()
  houseAccounts: boolean;

  @Field()
  whiteLabelApp: boolean;

  @Field()
  customDomain: boolean;
}

@ObjectType()
export class OperationalFlagsType {
  @Field()
  maintenanceMode: boolean;

  @Field()
  newMemberRegistration: boolean;

  @Field()
  onlineBooking: boolean;

  @Field()
  emailCampaigns: boolean;
}

@ObjectType()
export class FeatureFlagsType {
  @Field(() => ModuleFlagsType)
  modules: ModuleFlagsType;

  @Field(() => FeatureLevelFlagsType)
  features: FeatureLevelFlagsType;

  @Field(() => OperationalFlagsType)
  operational: OperationalFlagsType;
}
