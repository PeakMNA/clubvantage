import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export interface CreateUserDto {
  email: string;
  password: string;
  emailConfirm?: boolean;
  userMetadata?: {
    clubId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    [key: string]: any;
  };
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  emailConfirm?: boolean;
  userMetadata?: {
    clubId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    [key: string]: any;
  };
}

@Injectable()
export class SupabaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseAdminService.name);
  private adminClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey');

    if (!supabaseUrl || !serviceRoleKey) {
      this.logger.warn('Supabase URL or Service Role Key not configured');
      return;
    }

    this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase admin client initialized');
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  async createUser(dto: CreateUserDto): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: dto.emailConfirm ?? true,
      user_metadata: dto.userMetadata,
    });

    if (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
    }

    return {
      user: data?.user || null,
      error: error || null,
    };
  }

  async updateUser(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<{ user: User | null; error: Error | null }> {
    const updateData: any = {};

    if (dto.email) updateData.email = dto.email;
    if (dto.password) updateData.password = dto.password;
    if (dto.emailConfirm !== undefined) updateData.email_confirm = dto.emailConfirm;
    if (dto.userMetadata) updateData.user_metadata = dto.userMetadata;

    const { data, error } = await this.adminClient.auth.admin.updateUserById(
      userId,
      updateData,
    );

    if (error) {
      this.logger.error(`Failed to update user ${userId}: ${error.message}`);
    }

    return {
      user: data?.user || null,
      error: error || null,
    };
  }

  async deleteUser(userId: string): Promise<{ error: Error | null }> {
    const { error } = await this.adminClient.auth.admin.deleteUser(userId);

    if (error) {
      this.logger.error(`Failed to delete user ${userId}: ${error.message}`);
    }

    return { error: error || null };
  }

  async getUserById(userId: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.adminClient.auth.admin.getUserById(userId);

    return {
      user: data?.user || null,
      error: error || null,
    };
  }

  async getUserByEmail(email: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.adminClient.auth.admin.listUsers();

    if (error) {
      return { user: null, error };
    }

    const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    return { user: user || null, error: null };
  }

  async listUsers(options?: {
    page?: number;
    perPage?: number;
  }): Promise<{ users: User[]; error: Error | null }> {
    const { data, error } = await this.adminClient.auth.admin.listUsers({
      page: options?.page,
      perPage: options?.perPage,
    });

    return {
      users: data?.users || [],
      error: error || null,
    };
  }

  async inviteUserByEmail(
    email: string,
    options?: {
      redirectTo?: string;
      data?: Record<string, any>;
    },
  ): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: options?.redirectTo,
      data: options?.data,
    });

    return {
      user: data?.user || null,
      error: error || null,
    };
  }

  async generateLink(
    type: 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change_current' | 'email_change_new',
    email: string,
    options?: {
      password?: string;
      redirectTo?: string;
      data?: Record<string, any>;
    },
  ): Promise<{ properties: { action_link: string } | null; error: Error | null }> {
    const generateOptions: any = {
      type,
      email,
      options: {
        redirectTo: options?.redirectTo,
        data: options?.data,
      },
    };

    if (options?.password) {
      generateOptions.password = options.password;
    }

    const { data, error } = await this.adminClient.auth.admin.generateLink(generateOptions);

    return {
      properties: data?.properties ? { action_link: data.properties.action_link } : null,
      error: error || null,
    };
  }

  async updateUserMetadata(
    userId: string,
    metadata: Record<string, any>,
  ): Promise<{ user: User | null; error: Error | null }> {
    const { data: currentUser, error: getUserError } = await this.adminClient.auth.admin.getUserById(userId);

    if (getUserError) {
      return { user: null, error: getUserError };
    }

    const mergedMetadata = {
      ...currentUser.user?.user_metadata,
      ...metadata,
    };

    return this.updateUser(userId, { userMetadata: mergedMetadata });
  }
}
