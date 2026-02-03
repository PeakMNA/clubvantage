import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import { DocumentType } from '@prisma/client';

// Re-export the enum for use in other files
export { DocumentType };

// Register the enum for GraphQL
registerEnumType(DocumentType, {
  name: 'DocumentType',
  description: 'Type of member document',
});

@ObjectType()
export class MemberDocumentType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  memberId: string;

  @Field()
  name: string;

  @Field(() => DocumentType)
  type: DocumentType;

  @Field()
  fileName: string;

  @Field()
  fileUrl: string;

  @Field(() => Int, { nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  mimeType?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  expiryDate?: Date;

  @Field()
  isVerified: boolean;

  @Field({ nullable: true })
  verifiedBy?: string;

  @Field({ nullable: true })
  verifiedAt?: Date;

  @Field()
  uploadedBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class MemberDocumentConnection extends Paginated(MemberDocumentType) {}

@ObjectType()
export class UploadDocumentResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => MemberDocumentType, { nullable: true })
  document?: MemberDocumentType;
}

@ObjectType()
export class DeleteDocumentResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class VerifyDocumentResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => MemberDocumentType, { nullable: true })
  document?: MemberDocumentType;
}
