import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { DocumentsService } from './documents.service';
import { encodeCursor } from '../common/pagination';
import {
  MemberDocumentType,
  MemberDocumentConnection,
  UploadDocumentResultType,
  DeleteDocumentResultType,
  VerifyDocumentResultType,
} from './documents.types';
import {
  UploadDocumentInput,
  UpdateDocumentInput,
  VerifyDocumentInput,
  MemberDocumentsQueryArgs,
} from './documents.input';

/**
 * Resolver for Member Document management
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  // ============================================================================
  // DOCUMENT QUERIES
  // ============================================================================

  @Query(() => MemberDocumentConnection, {
    name: 'memberDocuments',
    description: 'Get all documents for a member with optional filtering',
  })
  async getMemberDocuments(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: MemberDocumentsQueryArgs,
  ): Promise<MemberDocumentConnection> {
    const { documents, total } = await this.documentsService.getMemberDocuments(
      user.tenantId,
      args,
    );

    const edges = documents.map((doc) => ({
      node: this.mapDocumentToGraphQL(doc),
      cursor: encodeCursor(doc.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: args.offset + documents.length < total,
        hasPreviousPage: args.offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: total,
    };
  }

  @Query(() => MemberDocumentType, {
    name: 'document',
    description: 'Get a single document by ID',
    nullable: true,
  })
  async getDocument(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MemberDocumentType | null> {
    const document = await this.documentsService.getDocument(user.tenantId, id);
    return document ? this.mapDocumentToGraphQL(document) : null;
  }

  @Query(() => String, {
    name: 'documentSignedUrl',
    description: 'Get a signed URL for temporary document access',
  })
  async getDocumentSignedUrl(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('expiresIn', { type: () => Int, nullable: true, defaultValue: 3600 })
    expiresIn: number,
  ): Promise<string> {
    return this.documentsService.getSignedUrl(user.tenantId, id, expiresIn);
  }

  // ============================================================================
  // DOCUMENT MUTATIONS
  // ============================================================================

  @Mutation(() => UploadDocumentResultType, {
    name: 'uploadMemberDocument',
    description: 'Upload a new document for a member',
  })
  async uploadMemberDocument(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UploadDocumentInput,
  ): Promise<UploadDocumentResultType> {
    try {
      const document = await this.documentsService.uploadDocument(
        user.tenantId,
        input,
        user.sub,
      );
      return {
        success: true,
        document: this.mapDocumentToGraphQL(document),
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  @Mutation(() => MemberDocumentType, {
    name: 'updateMemberDocument',
    description: 'Update document metadata',
  })
  async updateMemberDocument(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDocumentInput,
  ): Promise<MemberDocumentType> {
    const document = await this.documentsService.updateDocument(
      user.tenantId,
      id,
      input,
    );
    return this.mapDocumentToGraphQL(document);
  }

  @Mutation(() => DeleteDocumentResultType, {
    name: 'deleteMemberDocument',
    description: 'Delete a member document (soft delete)',
  })
  async deleteMemberDocument(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteDocumentResultType> {
    try {
      await this.documentsService.deleteDocument(user.tenantId, id);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  @Mutation(() => VerifyDocumentResultType, {
    name: 'verifyDocument',
    description: 'Verify or unverify a member document',
  })
  async verifyDocument(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: VerifyDocumentInput,
  ): Promise<VerifyDocumentResultType> {
    try {
      const document = await this.documentsService.verifyDocument(
        user.tenantId,
        input.documentId,
        input.isVerified,
        user.sub,
      );
      return {
        success: true,
        document: this.mapDocumentToGraphQL(document),
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapDocumentToGraphQL = (document: any): MemberDocumentType => ({
    id: document.id,
    clubId: document.clubId,
    memberId: document.memberId,
    name: document.name,
    type: document.type,
    fileName: document.fileName,
    fileUrl: document.fileUrl,
    fileSize: document.fileSize,
    mimeType: document.mimeType,
    description: document.description,
    expiryDate: document.expiryDate,
    isVerified: document.isVerified,
    verifiedBy: document.verifiedBy,
    verifiedAt: document.verifiedAt,
    uploadedBy: document.uploadedBy,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
}
