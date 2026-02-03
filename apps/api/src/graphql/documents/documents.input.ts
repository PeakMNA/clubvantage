import { InputType, Field, ID, Int, ArgsType } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { DocumentType } from './documents.types';
import { PaginationArgs } from '../common/pagination';

@InputType()
export class UploadDocumentInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field()
  @IsString()
  @MaxLength(255)
  name: string;

  @Field(() => DocumentType)
  @IsEnum(DocumentType)
  type: DocumentType;

  @Field()
  @IsString()
  @MaxLength(255)
  fileName: string;

  @Field()
  @IsString()
  @MaxLength(500)
  fileUrl: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  expiryDate?: Date;
}

@InputType()
export class UpdateDocumentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @Field(() => DocumentType, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  expiryDate?: Date;
}

@InputType()
export class VerifyDocumentInput {
  @Field(() => ID)
  @IsUUID()
  documentId: string;

  @Field()
  @IsBoolean()
  isVerified: boolean;
}

@ArgsType()
export class MemberDocumentsQueryArgs extends PaginationArgs {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => DocumentType, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeExpired?: boolean;

  // Computed helpers for offset pagination
  get limit(): number {
    return this.first || 50;
  }

  get offset(): number {
    return this.skip || 0;
  }
}
