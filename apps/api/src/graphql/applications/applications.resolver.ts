import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { ApplicationsService } from '@/modules/applications/applications.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  MembershipApplicationType,
  ApplicationConnection,
  ApplicationStatsType,
} from './applications.types';
import {
  CreateApplicationInput,
  UpdateApplicationInput,
  ChangeApplicationStatusInput,
  ApplicationsQueryArgs,
} from './applications.input';
import { encodeCursor } from '../common/pagination';

@Resolver(() => MembershipApplicationType)
@UseGuards(GqlAuthGuard)
export class ApplicationsResolver {
  private readonly logger = new Logger(ApplicationsResolver.name);

  constructor(private readonly applicationsService: ApplicationsService) {}

  @Query(() => ApplicationConnection, {
    name: 'applications',
    description: 'Get paginated list of membership applications',
  })
  async getApplications(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: ApplicationsQueryArgs,
  ): Promise<ApplicationConnection> {
    const { first, after, skip, status, search } = args;

    const page = skip ? Math.floor(skip / (first || 20)) + 1 : 1;
    const limit = first || 20;

    const result = await this.applicationsService.findAll(user.tenantId, {
      status,
      search,
      page,
      limit,
    });

    const edges = result.data.map((application: any) => ({
      node: this.transformApplication(application),
      cursor: encodeCursor(application.id),
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

  @Query(() => MembershipApplicationType, {
    name: 'application',
    description: 'Get a single membership application by ID',
  })
  async getApplication(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MembershipApplicationType> {
    const application = await this.applicationsService.findOne(user.tenantId, id);
    return this.transformApplication(application);
  }

  @Query(() => ApplicationStatsType, {
    name: 'applicationStats',
    description: 'Get application statistics',
  })
  async getApplicationStats(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ApplicationStatsType> {
    return this.applicationsService.getStats(user.tenantId);
  }

  @Mutation(() => MembershipApplicationType, {
    name: 'createApplication',
    description: 'Create a new membership application',
  })
  async createApplication(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateApplicationInput,
  ): Promise<MembershipApplicationType> {
    const application = await this.applicationsService.create(
      user.tenantId,
      input,
      user.sub,
      user.email,
    );
    return this.transformApplication(application);
  }

  @Mutation(() => MembershipApplicationType, {
    name: 'updateApplication',
    description: 'Update an existing membership application',
  })
  async updateApplication(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateApplicationInput,
  ): Promise<MembershipApplicationType> {
    const application = await this.applicationsService.update(
      user.tenantId,
      id,
      input,
      user.sub,
      user.email,
    );
    return this.transformApplication(application);
  }

  @Mutation(() => MembershipApplicationType, {
    name: 'changeApplicationStatus',
    description: 'Change the status of a membership application',
  })
  async changeApplicationStatus(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ChangeApplicationStatusInput,
  ): Promise<MembershipApplicationType> {
    const application = await this.applicationsService.changeStatus(
      user.tenantId,
      id,
      input,
      user.sub,
      user.email,
    );
    return this.transformApplication(application);
  }

  private transformApplication(application: any): MembershipApplicationType {
    return {
      id: application.id,
      applicationNumber: application.applicationNumber,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      membershipType: {
        id: application.membershipType.id,
        name: application.membershipType.name,
        code: application.membershipType.code,
        description: application.membershipType.description,
      },
      sponsor: application.sponsor
        ? {
            id: application.sponsor.id,
            memberId: application.sponsor.memberId,
            firstName: application.sponsor.firstName,
            lastName: application.sponsor.lastName,
            email: application.sponsor.email,
            phone: application.sponsor.phone,
          }
        : undefined,
      status: application.status,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      reviewedBy: application.reviewedBy,
      approvedAt: application.approvedAt,
      approvedBy: application.approvedBy,
      rejectedAt: application.rejectedAt,
      rejectedBy: application.rejectedBy,
      withdrawnAt: application.withdrawnAt,
      reviewNotes: application.reviewNotes,
      rejectionReason: application.rejectionReason,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
