import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  CreateLookupCategoryDto,
  UpdateLookupCategoryDto,
  CreateLookupValueDto,
  UpdateLookupValueDto,
  CreateLookupTranslationDto,
  UpdateLookupTranslationDto,
  LookupCategoryFilterDto,
  LookupValueFilterDto,
} from './dto';

@Injectable()
export class LookupsService {
  private readonly logger = new Logger(LookupsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // Category Operations
  // ============================================================================

  async findAllCategories(filter?: LookupCategoryFilterDto) {
    return this.prisma.lookupCategory.findMany({
      where: {
        ...(filter?.isGlobal !== undefined && { isGlobal: filter.isGlobal }),
        ...(filter?.isSystem !== undefined && { isSystem: filter.isSystem }),
      },
      include: {
        _count: { select: { values: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findCategoryByCode(code: string) {
    const category = await this.prisma.lookupCategory.findUnique({
      where: { code },
      include: {
        values: {
          where: { clubId: null }, // Only global defaults
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Lookup category '${code}' not found`);
    }

    return category;
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.lookupCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Lookup category not found');
    }

    return category;
  }

  // ============================================================================
  // Value Operations with Club Override Support
  // ============================================================================

  /**
   * Get lookup values for a category, merging global defaults with club-specific overrides.
   * Club-specific values take precedence over global defaults for the same code.
   */
  async findValuesByCategory(
    categoryCode: string,
    clubId?: string,
    includeInactive = false,
  ) {
    const category = await this.findCategoryByCode(categoryCode);

    // Get all global defaults
    const globalValues = await this.prisma.lookupValue.findMany({
      where: {
        categoryId: category.id,
        clubId: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        translations: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // If no club specified, return global defaults
    if (!clubId) {
      return globalValues;
    }

    // Get club-specific values
    const clubValues = await this.prisma.lookupValue.findMany({
      where: {
        categoryId: category.id,
        clubId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        translations: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Create a map of club-specific codes
    const clubCodesSet = new Set(clubValues.map((v) => v.code));

    // Merge: club values + global values not overridden
    const mergedValues = [
      ...clubValues,
      ...globalValues.filter((v) => !clubCodesSet.has(v.code)),
    ];

    // Sort by sortOrder
    return mergedValues.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findValueById(id: string) {
    const value = await this.prisma.lookupValue.findUnique({
      where: { id },
      include: {
        category: true,
        translations: true,
      },
    });

    if (!value) {
      throw new NotFoundException('Lookup value not found');
    }

    return value;
  }

  async createValue(clubId: string | null, dto: CreateLookupValueDto) {
    // Verify category exists
    await this.findCategoryById(dto.categoryId);

    // Check for duplicate code in same category+club scope
    const existing = await this.prisma.lookupValue.findFirst({
      where: {
        categoryId: dto.categoryId,
        clubId: clubId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Lookup value with code '${dto.code}' already exists in this category`,
      );
    }

    return this.prisma.lookupValue.create({
      data: {
        ...dto,
        clubId,
      },
      include: {
        category: true,
        translations: true,
      },
    });
  }

  async updateValue(id: string, dto: UpdateLookupValueDto) {
    const value = await this.findValueById(id);

    // If this is a system category value and it's a global default, prevent certain changes
    if (!value.clubId) {
      const category = await this.findCategoryById(value.categoryId);
      if (category.isSystem && dto.isActive === false) {
        throw new BadRequestException(
          'Cannot deactivate system lookup values. Create a club-specific override instead.',
        );
      }
    }

    return this.prisma.lookupValue.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        translations: true,
      },
    });
  }

  async deleteValue(id: string) {
    const value = await this.findValueById(id);

    // Check if this is a global system value
    if (!value.clubId) {
      const category = await this.findCategoryById(value.categoryId);
      if (category.isSystem) {
        throw new BadRequestException(
          'Cannot delete system lookup values. Deactivate or create a club-specific override instead.',
        );
      }
    }

    await this.prisma.lookupValue.delete({ where: { id } });
    return { success: true, message: 'Lookup value deleted' };
  }

  // ============================================================================
  // Translation Operations
  // ============================================================================

  async addTranslation(dto: CreateLookupTranslationDto) {
    // Verify value exists
    await this.findValueById(dto.lookupValueId);

    // Check for duplicate
    const existing = await this.prisma.lookupTranslation.findUnique({
      where: {
        lookupValueId_locale: {
          lookupValueId: dto.lookupValueId,
          locale: dto.locale,
        },
      },
    });

    if (existing) {
      // Update instead of error
      return this.prisma.lookupTranslation.update({
        where: { id: existing.id },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });
    }

    return this.prisma.lookupTranslation.create({
      data: dto,
    });
  }

  async updateTranslation(id: string, dto: UpdateLookupTranslationDto) {
    const translation = await this.prisma.lookupTranslation.findUnique({
      where: { id },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    return this.prisma.lookupTranslation.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTranslation(id: string) {
    const translation = await this.prisma.lookupTranslation.findUnique({
      where: { id },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.lookupTranslation.delete({ where: { id } });
    return { success: true, message: 'Translation deleted' };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get a single lookup value by category code and value code.
   * Returns club-specific value if exists, otherwise global default.
   */
  async getValueByCode(
    categoryCode: string,
    valueCode: string,
    clubId?: string,
  ) {
    const category = await this.findCategoryByCode(categoryCode);

    // Try club-specific first
    if (clubId) {
      const clubValue = await this.prisma.lookupValue.findFirst({
        where: {
          categoryId: category.id,
          clubId,
          code: valueCode,
          isActive: true,
        },
        include: { translations: true },
      });

      if (clubValue) return clubValue;
    }

    // Fall back to global
    const globalValue = await this.prisma.lookupValue.findFirst({
      where: {
        categoryId: category.id,
        clubId: null,
        code: valueCode,
        isActive: true,
      },
      include: { translations: true },
    });

    if (!globalValue) {
      throw new NotFoundException(
        `Lookup value '${valueCode}' not found in category '${categoryCode}'`,
      );
    }

    return globalValue;
  }
}
