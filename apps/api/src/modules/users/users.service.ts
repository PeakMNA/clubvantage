import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  RECEPTIONIST = 'RECEPTIONIST',
  ACCOUNTANT = 'ACCOUNTANT',
  PRO_SHOP = 'PRO_SHOP',
  GOLF_MARSHAL = 'GOLF_MARSHAL',
  F_AND_B = 'F_AND_B',
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: string[];
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  permissions?: string[];
  phone?: string;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventStore: EventStoreService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateUserDto,
    creatorId: string,
    creatorEmail: string,
  ) {
    // Check for duplicate email
    const existing = await this.prisma.user.findFirst({
      where: {
        clubId: tenantId,
        email: dto.email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash password
    const rounds = this.configService.get<number>('auth.bcryptRounds') || 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.user.create({
      data: {
        clubId: tenantId,
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as any,
        permissions: dto.permissions || [],
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'User',
      aggregateId: user.id,
      type: 'CREATED',
      data: { email: user.email, role: user.role },
      userId: creatorId,
      userEmail: creatorEmail,
    });

    return user;
  }

  async findAll(
    tenantId: string,
    options?: {
      search?: string;
      role?: UserRole;
      page?: number;
      limit?: number;
    },
  ) {
    const { search, role, page = 1, limit = 20 } = options || {};

    const where: any = {
      clubId: tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, clubId: tenantId, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        phone: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateUserDto,
    updaterId: string,
    updaterEmail: string,
  ) {
    await this.findOne(tenantId, id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as any,
        permissions: dto.permissions,
        phone: dto.phone,
        isActive: dto.isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'User',
      aggregateId: id,
      type: 'UPDATED',
      data: dto,
      userId: updaterId,
      userEmail: updaterEmail,
    });

    return user;
  }

  async lock(
    tenantId: string,
    id: string,
    minutes: number,
    lockerId: string,
    lockerEmail: string,
  ) {
    await this.findOne(tenantId, id);

    const lockedUntil = new Date(Date.now() + minutes * 60000);

    await this.prisma.user.update({
      where: { id },
      data: { lockedUntil },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'User',
      aggregateId: id,
      type: 'LOCKED',
      data: { lockedUntil, minutes },
      userId: lockerId,
      userEmail: lockerEmail,
    });

    return { message: `User locked until ${lockedUntil.toISOString()}` };
  }

  async unlock(
    tenantId: string,
    id: string,
    unlockerId: string,
    unlockerEmail: string,
  ) {
    await this.findOne(tenantId, id);

    await this.prisma.user.update({
      where: { id },
      data: { lockedUntil: null, failedAttempts: 0 },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'User',
      aggregateId: id,
      type: 'UNLOCKED',
      data: {},
      userId: unlockerId,
      userEmail: unlockerEmail,
    });

    return { message: 'User unlocked successfully' };
  }

  async softDelete(
    tenantId: string,
    id: string,
    deleterId: string,
    deleterEmail: string,
  ) {
    const user = await this.findOne(tenantId, id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'User',
      aggregateId: id,
      type: 'DELETED',
      data: { email: user.email },
      userId: deleterId,
      userEmail: deleterEmail,
    });

    return { message: 'User deleted successfully' };
  }

  async getActivityLog(tenantId: string, options?: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = options || {};

    return this.eventStore.getEventsByTenant(tenantId, {
      limit,
      offset: (page - 1) * limit,
    });
  }
}
