import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { UsersService } from '@/modules/users/users.service';
import {
  UserType,
  UserListResultType,
  StatusMessageType,
  ActivityLogResultType,
} from './users.types';
import {
  CreateUserInput,
  UpdateUserInput,
  UsersFilterInput,
  ActivityLogFilterInput,
} from './users.input';

@Resolver(() => UserType)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(private readonly usersService: UsersService) {}

  private transformUser(user: any): UserType {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions || [],
      phone: user.phone || undefined,
      isActive: user.isActive,
      emailVerified: user.emailVerified || undefined,
      lastLoginAt: user.lastLoginAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || undefined,
    };
  }

  @Query(() => UserListResultType, {
    name: 'users',
    description: 'Get paginated list of users with optional filters',
  })
  async getUsers(
    @GqlCurrentUser() user: JwtPayload,
    @Args('search', { nullable: true }) search?: string,
    @Args('role', { nullable: true }) role?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<UserListResultType> {
    const result = await this.usersService.findAll(user.tenantId, {
      search,
      role: role as any,
      page,
      limit,
    });

    return {
      data: result.data.map((u) => this.transformUser(u)),
      meta: result.meta,
    };
  }

  @Query(() => UserType, {
    name: 'user',
    description: 'Get a single user by ID',
  })
  async getUser(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<UserType> {
    const result = await this.usersService.findOne(user.tenantId, id);
    return this.transformUser(result);
  }

  @Query(() => ActivityLogResultType, {
    name: 'userActivityLog',
    description: 'Get activity log for users with pagination',
  })
  async getUserActivityLog(
    @GqlCurrentUser() user: JwtPayload,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<ActivityLogResultType> {
    const result = await this.usersService.getActivityLog(user.tenantId, {
      page,
      limit,
    });

    const pageNum = page || 1;
    const limitNum = limit || 50;
    const totalPages = Math.ceil(result.total / limitNum);

    return {
      data: result.events.map((event: any) => ({
        id: event.id,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        type: event.eventType,
        data: JSON.stringify(event.eventData),
        userId: event.userId,
        userEmail: event.userEmail,
        createdAt: event.createdAt,
      })),
      meta: {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }

  @Mutation(() => UserType, {
    name: 'createUser',
    description: 'Create a new user',
  })
  async createUser(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateUserInput,
  ): Promise<UserType> {
    const result = await this.usersService.create(
      user.tenantId,
      input as any,
      user.sub,
      user.email,
    );
    return this.transformUser(result);
  }

  @Mutation(() => UserType, {
    name: 'updateUser',
    description: 'Update an existing user',
  })
  async updateUser(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserType> {
    const result = await this.usersService.update(
      user.tenantId,
      id,
      input as any,
      user.sub,
      user.email,
    );
    return this.transformUser(result);
  }

  @Mutation(() => StatusMessageType, {
    name: 'lockUser',
    description: 'Lock a user account for a specified duration in minutes',
  })
  async lockUser(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('minutes', { type: () => Int }) minutes: number,
  ): Promise<StatusMessageType> {
    return this.usersService.lock(user.tenantId, id, minutes, user.sub, user.email);
  }

  @Mutation(() => StatusMessageType, {
    name: 'unlockUser',
    description: 'Unlock a user account',
  })
  async unlockUser(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<StatusMessageType> {
    return this.usersService.unlock(user.tenantId, id, user.sub, user.email);
  }

  @Mutation(() => StatusMessageType, {
    name: 'deleteUser',
    description: 'Soft delete a user',
  })
  async deleteUser(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<StatusMessageType> {
    return this.usersService.softDelete(user.tenantId, id, user.sub, user.email);
  }
}
