import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class SignOffStepInput {
  @Field(() => ID)
  @IsUUID()
  stepId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

@InputType()
export class SkipStepInput {
  @Field(() => ID)
  @IsUUID()
  stepId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
