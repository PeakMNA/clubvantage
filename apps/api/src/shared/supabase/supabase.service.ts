import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseAnonKey = this.configService.get<string>('supabase.anonKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      this.logger.warn('Supabase URL or Anon Key not configured');
      return;
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    this.logger.log('Supabase client initialized');
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error: error || null,
    };
  }

  async signOut(accessToken: string): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.admin.signOut(accessToken);
    return { error: error || null };
  }

  async getUser(accessToken: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.client.auth.getUser(accessToken);
    return {
      user: data?.user || null,
      error: error || null,
    };
  }

  async refreshSession(
    refreshToken: string,
  ): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    return {
      session: data?.session || null,
      error: error || null,
    };
  }

  async verifyOtp(token: string, type: 'email' | 'phone' = 'email'): Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }> {
    const { data, error } = await this.client.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error: error || null,
    };
  }
}
