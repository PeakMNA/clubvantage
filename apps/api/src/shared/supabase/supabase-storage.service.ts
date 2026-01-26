import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import supabaseConfig from '@/config/supabase.config';

export enum StorageBucket {
  AVATARS = 'avatars',
  DOCUMENTS = 'documents',
  INVOICES = 'invoices',
  MEMBER_FILES = 'member-files',
}

export interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: Buffer;
  contentType: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
  signedUrl?: string;
}

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;

  constructor(
    @Inject(supabaseConfig.KEY)
    private config: ConfigType<typeof supabaseConfig>,
  ) {
    this.supabase = createClient(this.config.url, this.config.serviceRoleKey);
  }

  /**
   * Upload a file to Supabase Storage
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const { bucket, path, file, contentType, upsert = false } = options;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const publicUrl = this.getPublicUrl(bucket, data.path);

    return {
      path: data.path,
      publicUrl,
    };
  }

  /**
   * Upload a member avatar
   */
  async uploadAvatar(
    tenantId: string,
    memberId: string,
    file: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const extension = this.getExtensionFromContentType(contentType);
    const path = `${tenantId}/${memberId}/avatar.${extension}`;

    return this.upload({
      bucket: StorageBucket.AVATARS,
      path,
      file,
      contentType,
      upsert: true,
    });
  }

  /**
   * Upload a document (contracts, applications, etc.)
   */
  async uploadDocument(
    tenantId: string,
    category: string,
    filename: string,
    file: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const path = `${tenantId}/${category}/${timestamp}-${filename}`;

    return this.upload({
      bucket: StorageBucket.DOCUMENTS,
      path,
      file,
      contentType,
    });
  }

  /**
   * Upload an invoice PDF
   */
  async uploadInvoice(
    tenantId: string,
    invoiceNumber: string,
    file: Buffer,
  ): Promise<UploadResult> {
    const path = `${tenantId}/${invoiceNumber}.pdf`;

    return this.upload({
      bucket: StorageBucket.INVOICES,
      path,
      file,
      contentType: 'application/pdf',
      upsert: true,
    });
  }

  /**
   * Upload a member-specific file
   */
  async uploadMemberFile(
    tenantId: string,
    memberId: string,
    filename: string,
    file: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const path = `${tenantId}/${memberId}/${timestamp}-${filename}`;

    return this.upload({
      bucket: StorageBucket.MEMBER_FILES,
      path,
      file,
      contentType,
    });
  }

  /**
   * Delete a file from storage
   */
  async delete(bucket: StorageBucket, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get a public URL for a file
   */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Get a signed URL for temporary access to a private file
   */
  async getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn = 3600,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * List files in a directory
   */
  async listFiles(
    bucket: StorageBucket,
    path: string,
  ): Promise<{ name: string; id: string; metadata: Record<string, unknown> }[]> {
    const { data, error } = await this.supabase.storage.from(bucket).list(path);

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data.map((file) => ({
      name: file.name,
      id: file.id,
      metadata: file.metadata || {},
    }));
  }

  /**
   * Move/rename a file
   */
  async move(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string,
  ): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      throw new Error(`Failed to move file: ${error.message}`);
    }
  }

  /**
   * Copy a file
   */
  async copy(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string,
  ): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) {
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  private getExtensionFromContentType(contentType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
    };

    return extensions[contentType] || 'bin';
  }
}
