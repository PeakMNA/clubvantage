import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ConfigurablePackagesService } from '@/modules/configurable-packages/configurable-packages.service';
import { FeatureCategory } from '@prisma/client';
import {
  FeatureDefinitionType,
  VerticalType,
  PackageType,
  PackageFeatureType,
  ClubPackageType,
  ClubAddonType,
} from './configurable-packages.types';
import {
  CreateFeatureDefinitionInput,
  UpdateFeatureDefinitionInput,
  CreateVerticalInput,
  UpdateVerticalInput,
  CreatePackageInput,
  UpdatePackageInput,
  PackageFeatureInput,
  AssignClubPackageInput,
  AddClubAddonInput,
} from './configurable-packages.input';

function requirePlatformAdmin(user: JwtPayload): void {
  const isPlatformAdmin =
    user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN');
  if (!isPlatformAdmin) {
    throw new ForbiddenException(
      'Platform admin access required.',
    );
  }
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class ConfigurablePackagesResolver {
  constructor(
    private readonly service: ConfigurablePackagesService,
  ) {}

  // ============================================================================
  // FEATURE DEFINITIONS
  // ============================================================================

  @Query(() => [FeatureDefinitionType], { name: 'featureDefinitions' })
  async getFeatureDefinitions(
    @GqlCurrentUser() user: JwtPayload,
    @Args('category', { type: () => FeatureCategory, nullable: true }) category?: FeatureCategory,
  ) {
    requirePlatformAdmin(user);
    return this.service.getFeatureDefinitions(category);
  }

  @Query(() => FeatureDefinitionType, { name: 'featureDefinition' })
  async getFeatureDefinition(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    requirePlatformAdmin(user);
    return this.service.getFeatureDefinition(id);
  }

  @Mutation(() => FeatureDefinitionType)
  async createFeatureDefinition(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateFeatureDefinitionInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.createFeatureDefinition(input);
  }

  @Mutation(() => FeatureDefinitionType)
  async updateFeatureDefinition(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFeatureDefinitionInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.updateFeatureDefinition(id, input);
  }

  // ============================================================================
  // VERTICALS
  // ============================================================================

  @Query(() => [VerticalType], { name: 'verticals' })
  async getVerticals(@GqlCurrentUser() user: JwtPayload) {
    requirePlatformAdmin(user);
    return this.service.getVerticals();
  }

  @Query(() => VerticalType, { name: 'vertical' })
  async getVertical(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    requirePlatformAdmin(user);
    return this.service.getVertical(id);
  }

  @Mutation(() => VerticalType)
  async createVertical(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateVerticalInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.createVertical(input);
  }

  @Mutation(() => VerticalType)
  async updateVertical(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateVerticalInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.updateVertical(id, input);
  }

  // ============================================================================
  // PACKAGES
  // ============================================================================

  @Query(() => [PackageType], { name: 'packages' })
  async getPackages(
    @GqlCurrentUser() user: JwtPayload,
    @Args('verticalId', { type: () => ID, nullable: true }) verticalId?: string,
  ) {
    requirePlatformAdmin(user);
    return this.service.getPackages(verticalId);
  }

  @Query(() => PackageType, { name: 'package' })
  async getPackage(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    requirePlatformAdmin(user);
    return this.service.getPackage(id);
  }

  @Mutation(() => PackageType)
  async createPackage(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreatePackageInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.createPackage(input);
  }

  @Mutation(() => PackageType)
  async updatePackage(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePackageInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.updatePackage(id, input);
  }

  @Mutation(() => [PackageFeatureType])
  async setPackageFeatures(
    @GqlCurrentUser() user: JwtPayload,
    @Args('packageId', { type: () => ID }) packageId: string,
    @Args('features', { type: () => [PackageFeatureInput] }) features: PackageFeatureInput[],
  ) {
    requirePlatformAdmin(user);
    return this.service.setPackageFeatures(packageId, features);
  }

  // ============================================================================
  // CLUB PACKAGE ASSIGNMENT
  // ============================================================================

  @Query(() => ClubPackageType, { name: 'clubPackage', nullable: true })
  async getClubPackage(
    @GqlCurrentUser() user: JwtPayload,
    @Args('clubId', { type: () => ID }) clubId: string,
  ) {
    requirePlatformAdmin(user);
    return this.service.getClubPackage(clubId);
  }

  @Mutation(() => ClubPackageType)
  async assignClubPackage(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AssignClubPackageInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.assignClubPackage(input);
  }

  // ============================================================================
  // CLUB ADD-ONS
  // ============================================================================

  @Query(() => [ClubAddonType], { name: 'clubAddons' })
  async getClubAddons(
    @GqlCurrentUser() user: JwtPayload,
    @Args('clubId', { type: () => ID }) clubId: string,
  ) {
    requirePlatformAdmin(user);
    return this.service.getClubAddons(clubId);
  }

  @Mutation(() => ClubAddonType)
  async addClubAddon(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AddClubAddonInput,
  ) {
    requirePlatformAdmin(user);
    return this.service.addClubAddon(input);
  }

  @Mutation(() => ClubAddonType)
  async removeClubAddon(
    @GqlCurrentUser() user: JwtPayload,
    @Args('clubId', { type: () => ID }) clubId: string,
    @Args('featureDefinitionId', { type: () => ID }) featureDefinitionId: string,
  ) {
    requirePlatformAdmin(user);
    return this.service.removeClubAddon(clubId, featureDefinitionId);
  }
}
