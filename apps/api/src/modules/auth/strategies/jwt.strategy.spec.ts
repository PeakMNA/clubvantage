import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;

  const mockUser = {
    id: 'user-123',
    isActive: true,
    lockedUntil: null,
    clubId: 'club-456',
    role: 'STAFF',
    permissions: ['read', 'write'],
  };

  const mockPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    tenantId: 'club-456',
    roles: ['STAFF'],
    permissions: ['read'],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const mockRedisService = {
      cacheAside: jest.fn(),
      del: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    redisService = module.get(RedisService) as jest.Mocked<RedisService>;
  });

  describe('validate', () => {
    it('should return enriched payload for valid cached user', async () => {
      const cachedUser = {
        id: 'user-123',
        isActive: true,
        lockedUntil: null,
        clubId: 'club-456',
        role: 'STAFF',
        permissions: ['read', 'write'],
      };

      redisService.cacheAside.mockResolvedValue(cachedUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        ...mockPayload,
        tenantId: 'club-456',
        roles: ['STAFF'],
        permissions: ['read', 'write'],
      });
      expect(redisService.cacheAside).toHaveBeenCalledWith(
        'auth:user:user-123',
        60,
        expect.any(Function),
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      redisService.cacheAside.mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
    });

    it('should throw UnauthorizedException for deactivated user and invalidate cache', async () => {
      redisService.cacheAside.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        new UnauthorizedException('User account is deactivated'),
      );
      expect(redisService.del).toHaveBeenCalledWith('auth:user:user-123');
    });

    it('should throw UnauthorizedException for locked user', async () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      redisService.cacheAside.mockResolvedValue({
        ...mockUser,
        lockedUntil: futureDate,
      });

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        new UnauthorizedException('User account is locked'),
      );
    });

    it('should allow access for user with expired lock', async () => {
      const pastDate = new Date(Date.now() - 60000).toISOString();
      redisService.cacheAside.mockResolvedValue({
        ...mockUser,
        lockedUntil: pastDate,
      });

      const result = await strategy.validate(mockPayload);

      expect(result.tenantId).toBe('club-456');
    });

    it('should use tenantId from payload when user has no clubId', async () => {
      redisService.cacheAside.mockResolvedValue({
        ...mockUser,
        clubId: null,
      });

      const result = await strategy.validate(mockPayload);

      expect(result.tenantId).toBe('club-456');
    });
  });

  describe('invalidateUserCache', () => {
    it('should delete user cache from Redis', async () => {
      await strategy.invalidateUserCache('user-123');

      expect(redisService.del).toHaveBeenCalledWith('auth:user:user-123');
    });
  });
});
