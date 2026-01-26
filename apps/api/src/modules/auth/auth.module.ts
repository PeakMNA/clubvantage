import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'supabase' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    SupabaseStrategy,
    JwtAuthGuard,
    SupabaseAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, SupabaseAuthGuard],
})
export class AuthModule {}
