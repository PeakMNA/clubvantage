import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { MembersService } from '@/modules/members/members.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  MemberType,
  MemberConnection,
  MemberStatsType,
  DeleteMemberResponseType,
  DeleteDependentResponseType,
  DependentType,
  MembershipTypeType,
} from './members.types';
import {
  CreateMemberInput,
  UpdateMemberInput,
  ChangeStatusInput,
  CreateDependentInput,
  UpdateDependentInput,
  MembersQueryArgs,
} from './members.input';
import { encodeCursor, decodeCursor } from '../common/pagination';

@Resolver(() => MemberType)
@UseGuards(GqlAuthGuard)
export class MembersResolver {
  private readonly logger = new Logger(MembersResolver.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => MemberConnection, { name: 'members', description: 'Get paginated list of members' })
  async getMembers(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: MembersQueryArgs,
  ): Promise<MemberConnection> {
    const { first, after, skip, ...queryParams } = args;

    // Convert GraphQL pagination to REST pagination
    const page = skip ? Math.floor(skip / (first || 20)) + 1 : 1;
    const limit = first || 20;

    const result = await this.membersService.findAll(user.tenantId, {
      ...queryParams,
      page,
      limit,
    });

    // Transform to connection format
    const edges = result.data.map((member: any) => ({
      node: this.transformMember(member),
      cursor: encodeCursor(member.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: page < result.meta.totalPages,
        hasPreviousPage: page > 1,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: result.meta.total,
    };
  }

  @Query(() => MemberType, { name: 'member', description: 'Get a single member by ID' })
  async getMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MemberType> {
    const member = await this.membersService.findOne(user.tenantId, id);
    return this.transformMember(member);
  }

  @Query(() => MemberStatsType, { name: 'memberStats', description: 'Get member statistics' })
  async getMemberStats(@GqlCurrentUser() user: JwtPayload): Promise<MemberStatsType> {
    return this.membersService.getStats(user.tenantId);
  }

  @Query(() => MemberType, { name: 'myMember', nullable: true, description: 'Get the current user\'s member profile' })
  async getMyMember(@GqlCurrentUser() user: JwtPayload): Promise<MemberType | null> {
    // Find the user's associated member via the User model
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { member: true },
    });

    if (!dbUser?.memberId) {
      return null;
    }

    const member = await this.membersService.findOne(user.tenantId, dbUser.memberId);
    return this.transformMember(member);
  }

  @Query(() => [DependentType], { name: 'memberDependents', description: 'Get member dependents' })
  async getMemberDependents(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<DependentType[]> {
    const dependents = await this.membersService.getDependents(user.tenantId, memberId);
    return dependents.map((d: any) => ({
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      relationship: d.relationship,
      dateOfBirth: d.dateOfBirth,
      email: d.email,
      phone: d.phone,
      isActive: d.isActive,
    }));
  }

  @Query(() => [MembershipTypeType], { name: 'membershipTypes', description: 'Get all membership types' })
  async getMembershipTypes(@GqlCurrentUser() user: JwtPayload): Promise<MembershipTypeType[]> {
    if (!user || !user.tenantId) {
      return [];
    }

    const types = await this.prisma.membershipType.findMany({
      where: {
        clubId: user.tenantId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return types.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      description: t.description || undefined,
      monthlyFee: t.monthlyFee ? Number(t.monthlyFee) : undefined,
      annualFee: t.annualFee ? Number(t.annualFee) : undefined,
      joiningFee: t.joiningFee ? Number(t.joiningFee) : undefined,
      allowGuests: t.allowGuests,
      maxGuestsPerBooking: t.maxGuestsPerBooking,
      allowFamilyMembers: t.allowFamilyMembers,
      maxFamilyMembers: t.maxFamilyMembers,
      bookingAdvanceDays: t.bookingAdvanceDays,
      priorityBooking: t.priorityBooking,
    }));
  }

  @Mutation(() => MemberType, { name: 'createMember', description: 'Create a new member' })
  async createMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateMemberInput,
  ): Promise<MemberType> {
    const member = await this.membersService.create(
      user.tenantId,
      {
        ...input,
        dateOfBirth: input.dateOfBirth?.toISOString(),
        joinDate: input.joinDate?.toISOString(),
        expiryDate: input.expiryDate?.toISOString(),
      },
      user.sub,
      user.email,
    );
    return this.transformMember(member);
  }

  @Mutation(() => MemberType, { name: 'updateMember', description: 'Update an existing member' })
  async updateMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMemberInput,
  ): Promise<MemberType> {
    const member = await this.membersService.update(
      user.tenantId,
      id,
      {
        ...input,
        dateOfBirth: input.dateOfBirth?.toISOString(),
        expiryDate: input.expiryDate?.toISOString(),
      },
      user.sub,
      user.email,
    );
    return this.transformMember(member);
  }

  @Mutation(() => MemberType, { name: 'changeMemberStatus', description: 'Change member status' })
  async changeMemberStatus(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ChangeStatusInput,
  ): Promise<MemberType> {
    const member = await this.membersService.changeStatus(
      user.tenantId,
      id,
      input,
      user.sub,
      user.email,
    );
    return this.transformMember(member);
  }

  @Mutation(() => DeleteMemberResponseType, { name: 'deleteMember', description: 'Soft delete a member' })
  async deleteMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteMemberResponseType> {
    return this.membersService.softDelete(user.tenantId, id, user.sub, user.email);
  }

  // ============================================================================
  // DEPENDENT MUTATIONS
  // ============================================================================

  @Mutation(() => DependentType, { name: 'createDependent', description: 'Add a dependent to a member' })
  async createDependent(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateDependentInput,
  ): Promise<DependentType> {
    // Verify the member belongs to this tenant
    const member = await this.prisma.member.findFirst({
      where: { id: input.memberId, clubId: user.tenantId },
    });
    if (!member) {
      throw new Error('Member not found');
    }

    const dependent = await this.prisma.dependent.create({
      data: {
        memberId: input.memberId,
        firstName: input.firstName,
        lastName: input.lastName,
        relationship: input.relationship,
        dateOfBirth: input.dateOfBirth,
        email: input.email,
        phone: input.phone,
        isActive: true,
      },
    });

    return {
      id: dependent.id,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relationship: dependent.relationship,
      dateOfBirth: dependent.dateOfBirth ?? undefined,
      email: dependent.email ?? undefined,
      phone: dependent.phone ?? undefined,
      isActive: dependent.isActive,
    };
  }

  @Mutation(() => DependentType, { name: 'updateDependent', description: 'Update a dependent' })
  async updateDependent(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDependentInput,
  ): Promise<DependentType> {
    // Verify the dependent belongs to a member in this tenant
    const existing = await this.prisma.dependent.findFirst({
      where: { id },
      include: { member: true },
    });
    if (!existing || existing.member.clubId !== user.tenantId) {
      throw new Error('Dependent not found');
    }

    const dependent = await this.prisma.dependent.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        relationship: input.relationship,
        dateOfBirth: input.dateOfBirth,
        email: input.email,
        phone: input.phone,
        isActive: input.isActive,
      },
    });

    return {
      id: dependent.id,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relationship: dependent.relationship,
      dateOfBirth: dependent.dateOfBirth ?? undefined,
      email: dependent.email ?? undefined,
      phone: dependent.phone ?? undefined,
      isActive: dependent.isActive,
    };
  }

  @Mutation(() => DeleteDependentResponseType, { name: 'deleteDependent', description: 'Delete a dependent' })
  async deleteDependent(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteDependentResponseType> {
    // Verify the dependent belongs to a member in this tenant
    const existing = await this.prisma.dependent.findFirst({
      where: { id },
      include: { member: true },
    });
    if (!existing || existing.member.clubId !== user.tenantId) {
      throw new Error('Dependent not found');
    }

    await this.prisma.dependent.delete({ where: { id } });

    return { message: 'Dependent deleted successfully' };
  }

  private transformMember(member: any): MemberType {
    return {
      id: member.id,
      memberId: member.memberId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      avatarUrl: member.avatarUrl,
      address: member.address,
      nationality: member.nationality,
      idNumber: member.idNumber,
      emergencyContact: member.emergencyContact,
      emergencyPhone: member.emergencyPhone,
      status: member.status,
      joinDate: member.joinDate,
      expiryDate: member.expiryDate,
      renewalDate: member.renewalDate,
      isPrimaryMember: member.isPrimaryMember,
      creditBalance: member.creditBalance?.toString() || '0',
      outstandingBalance: member.outstandingBalance?.toString() || '0',
      notes: member.notes,
      tags: member.tags || [],
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      membershipType: member.membershipType,
      membershipTier: member.membershipTier,
      household: member.household,
      referredBy: member.referredBy,
      dependents: member.dependents?.map((d: any) => ({
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        relationship: d.relationship,
        dateOfBirth: d.dateOfBirth,
        email: d.email,
        phone: d.phone,
        isActive: d.isActive,
      })),
    };
  }
}
