import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  SupabaseStorageService,
  StorageBucket,
} from '@/shared/supabase/supabase-storage.service';
import { DocumentType, Prisma } from '@prisma/client';
import {
  UploadDocumentInput,
  UpdateDocumentInput,
  MemberDocumentsQueryArgs,
} from './documents.input';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // ============================================================================
  // DOCUMENT QUERIES
  // ============================================================================

  /**
   * Get all documents for a member with optional filtering
   */
  async getMemberDocuments(tenantId: string, args: MemberDocumentsQueryArgs) {
    const where: Prisma.MemberDocumentWhereInput = {
      clubId: tenantId,
      memberId: args.memberId,
      deletedAt: null,
    };

    if (args.type) {
      where.type = args.type;
    }

    if (args.isVerified !== undefined) {
      where.isVerified = args.isVerified;
    }

    // Filter out expired documents unless includeExpired is true
    if (!args.includeExpired) {
      where.OR = [{ expiryDate: null }, { expiryDate: { gte: new Date() } }];
    }

    const [documents, total] = await Promise.all([
      this.prisma.memberDocument.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: args.offset || 0,
        take: args.limit || 50,
      }),
      this.prisma.memberDocument.count({ where }),
    ]);

    return { documents, total };
  }

  /**
   * Get a single document by ID
   */
  async getDocument(tenantId: string, documentId: string) {
    const document = await this.prisma.memberDocument.findFirst({
      where: {
        id: documentId,
        clubId: tenantId,
        deletedAt: null,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * Get documents by type for a member
   */
  async getMemberDocumentsByType(
    tenantId: string,
    memberId: string,
    type: DocumentType,
  ) {
    return this.prisma.memberDocument.findMany({
      where: {
        clubId: tenantId,
        memberId,
        type,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================================
  // DOCUMENT MUTATIONS
  // ============================================================================

  /**
   * Upload a new document for a member
   * Note: The actual file upload should be done separately via Supabase Storage
   * This method creates the database record with the file URL
   */
  async uploadDocument(
    tenantId: string,
    input: UploadDocumentInput,
    uploadedBy: string,
  ) {
    // Verify the member exists and belongs to this tenant
    const member = await this.prisma.member.findFirst({
      where: { id: input.memberId, clubId: tenantId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Create the document record
    const document = await this.prisma.memberDocument.create({
      data: {
        clubId: tenantId,
        memberId: input.memberId,
        name: input.name,
        type: input.type,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        description: input.description,
        expiryDate: input.expiryDate,
        uploadedBy,
      },
    });

    return document;
  }

  /**
   * Upload a document file to storage and create the database record
   */
  async uploadDocumentWithFile(
    tenantId: string,
    memberId: string,
    name: string,
    type: DocumentType,
    fileName: string,
    file: Buffer,
    contentType: string,
    uploadedBy: string,
    description?: string,
    expiryDate?: Date,
  ) {
    // Verify the member exists
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, clubId: tenantId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Upload file to Supabase Storage
    const uploadResult = await this.storageService.uploadMemberFile(
      tenantId,
      memberId,
      fileName,
      file,
      contentType,
    );

    // Create the document record
    const document = await this.prisma.memberDocument.create({
      data: {
        clubId: tenantId,
        memberId,
        name,
        type,
        fileName,
        fileUrl: uploadResult.publicUrl,
        fileSize: file.length,
        mimeType: contentType,
        description,
        expiryDate,
        uploadedBy,
      },
    });

    return document;
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    tenantId: string,
    documentId: string,
    input: UpdateDocumentInput,
  ) {
    const existing = await this.prisma.memberDocument.findFirst({
      where: { id: documentId, clubId: tenantId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    const updateData: Prisma.MemberDocumentUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.expiryDate !== undefined) updateData.expiryDate = input.expiryDate;

    return this.prisma.memberDocument.update({
      where: { id: documentId },
      data: updateData,
    });
  }

  /**
   * Delete a document (soft delete)
   */
  async deleteDocument(tenantId: string, documentId: string) {
    const document = await this.prisma.memberDocument.findFirst({
      where: { id: documentId, clubId: tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Soft delete by setting deletedAt
    await this.prisma.memberDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    // Optionally delete from storage (commenting out to keep files for audit)
    // try {
    //   await this.storageService.delete(StorageBucket.MEMBER_FILES, document.fileUrl);
    // } catch (error) {
    //   // Log but don't fail if storage deletion fails
    //   console.warn(`Failed to delete file from storage: ${error.message}`);
    // }

    return true;
  }

  /**
   * Permanently delete a document (hard delete)
   */
  async permanentlyDeleteDocument(tenantId: string, documentId: string) {
    const document = await this.prisma.memberDocument.findFirst({
      where: { id: documentId, clubId: tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete from database
    await this.prisma.memberDocument.delete({
      where: { id: documentId },
    });

    // Try to delete from storage
    try {
      // Extract the path from the URL
      const url = new URL(document.fileUrl);
      const pathParts = url.pathname.split('/');
      // Find the path after the bucket name
      const bucketIndex = pathParts.findIndex((p) => p === 'member-files');
      if (bucketIndex !== -1) {
        const storagePath = pathParts.slice(bucketIndex + 1).join('/');
        await this.storageService.delete(StorageBucket.MEMBER_FILES, storagePath);
      }
    } catch (error) {
      // Log but don't fail if storage deletion fails
      console.warn(`Failed to delete file from storage: ${(error as Error).message}`);
    }

    return true;
  }

  // ============================================================================
  // DOCUMENT VERIFICATION
  // ============================================================================

  /**
   * Verify or unverify a document
   */
  async verifyDocument(
    tenantId: string,
    documentId: string,
    isVerified: boolean,
    verifiedBy: string,
  ) {
    const document = await this.prisma.memberDocument.findFirst({
      where: { id: documentId, clubId: tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.memberDocument.update({
      where: { id: documentId },
      data: {
        isVerified,
        verifiedBy: isVerified ? verifiedBy : null,
        verifiedAt: isVerified ? new Date() : null,
      },
    });
  }

  // ============================================================================
  // STORAGE OPERATIONS
  // ============================================================================

  /**
   * Get a signed URL for temporary access to a document
   */
  async getSignedUrl(tenantId: string, documentId: string, expiresIn = 3600) {
    const document = await this.prisma.memberDocument.findFirst({
      where: { id: documentId, clubId: tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Extract the path from the URL
    const url = new URL(document.fileUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex((p) => p === 'member-files');
    if (bucketIndex === -1) {
      throw new BadRequestException('Invalid file URL');
    }

    const storagePath = pathParts.slice(bucketIndex + 1).join('/');
    return this.storageService.getSignedUrl(
      StorageBucket.MEMBER_FILES,
      storagePath,
      expiresIn,
    );
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Get document counts by type for a member
   */
  async getDocumentCountsByType(tenantId: string, memberId: string) {
    const counts = await this.prisma.memberDocument.groupBy({
      by: ['type'],
      where: {
        clubId: tenantId,
        memberId,
        deletedAt: null,
      },
      _count: { type: true },
    });

    return counts.reduce(
      (acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      },
      {} as Record<DocumentType, number>,
    );
  }

  /**
   * Check if a member has all required documents verified
   */
  async checkRequiredDocuments(
    tenantId: string,
    memberId: string,
    requiredTypes: DocumentType[],
  ) {
    const documents = await this.prisma.memberDocument.findMany({
      where: {
        clubId: tenantId,
        memberId,
        type: { in: requiredTypes },
        isVerified: true,
        deletedAt: null,
        OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }],
      },
    });

    const foundTypes = new Set(documents.map((d) => d.type));
    const missingTypes = requiredTypes.filter((type) => !foundTypes.has(type));

    return {
      isComplete: missingTypes.length === 0,
      missingTypes,
      verifiedCount: documents.length,
      requiredCount: requiredTypes.length,
    };
  }
}
