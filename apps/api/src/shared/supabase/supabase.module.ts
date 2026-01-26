import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { SupabaseAdminService } from './supabase-admin.service';
import { SupabaseStorageService } from './supabase-storage.service';
import { SupabaseRealtimeService } from './supabase-realtime.service';
import supabaseConfig from '@/config/supabase.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(supabaseConfig)],
  providers: [
    SupabaseService,
    SupabaseAdminService,
    SupabaseStorageService,
    SupabaseRealtimeService,
  ],
  exports: [
    SupabaseService,
    SupabaseAdminService,
    SupabaseStorageService,
    SupabaseRealtimeService,
  ],
})
export class SupabaseModule {}
