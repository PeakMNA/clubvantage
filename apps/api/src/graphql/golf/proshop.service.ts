import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  ProShopCategoryType,
  ProShopProductType,
  ProShopVariantType,
  ProShopProductConnectionType,
  TaxType,
} from './golf.types';
import {
  CreateProShopCategoryInput,
  UpdateProShopCategoryInput,
  CreateProShopProductInput,
  UpdateProShopProductInput,
  BulkUpdateProShopProductInput,
  ProShopProductFilterInput,
} from './proshop.input';

@Injectable()
export class ProShopService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * Get all categories for a club
   */
  async getCategories(clubId: string): Promise<ProShopCategoryType[]> {
    const categories = await this.prisma.proshopCategory.findMany({
      where: { clubId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((c) => this.mapToCategory(c, c._count.products));
  }

  /**
   * Get a single category
   */
  async getCategory(id: string): Promise<ProShopCategoryType | null> {
    const category = await this.prisma.proshopCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return category ? this.mapToCategory(category, category._count.products) : null;
  }

  /**
   * Create a new category
   */
  async createCategory(
    clubId: string,
    input: CreateProShopCategoryInput,
  ): Promise<ProShopCategoryType> {
    // Check for duplicate name
    const existing = await this.prisma.proshopCategory.findFirst({
      where: { clubId, name: { equals: input.name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Category "${input.name}" already exists`);
    }

    // Get max sort order
    const maxOrder = await this.prisma.proshopCategory.aggregate({
      where: { clubId },
      _max: { sortOrder: true },
    });

    const category = await this.prisma.proshopCategory.create({
      data: {
        clubId,
        name: input.name,
        description: input.description,
        defaultTaxRate: input.defaultTaxRate,
        defaultTaxType: input.defaultTaxType,
        isActive: input.isActive ?? true,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return this.mapToCategory(category, 0);
  }

  /**
   * Update a category
   */
  async updateCategory(
    id: string,
    input: UpdateProShopCategoryInput,
  ): Promise<ProShopCategoryType> {
    const category = await this.prisma.proshopCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    // Check for duplicate name if changing
    if (input.name && input.name !== category.name) {
      const existing = await this.prisma.proshopCategory.findFirst({
        where: {
          clubId: category.clubId,
          name: { equals: input.name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Category "${input.name}" already exists`);
      }
    }

    const updated = await this.prisma.proshopCategory.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        defaultTaxRate: input.defaultTaxRate,
        defaultTaxType: input.defaultTaxType,
        isActive: input.isActive,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return this.mapToCategory(updated, updated._count.products);
  }

  /**
   * Delete a category
   */
  async deleteCategory(
    id: string,
    moveProductsTo?: string,
  ): Promise<boolean> {
    const category = await this.prisma.proshopCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    // If category has products, require moveProductsTo
    if (category._count.products > 0) {
      if (!moveProductsTo) {
        throw new BadRequestException(
          `Category has ${category._count.products} products. Provide moveProductsTo parameter.`,
        );
      }

      // Verify target category exists
      const targetCategory = await this.prisma.proshopCategory.findUnique({
        where: { id: moveProductsTo },
      });

      if (!targetCategory || targetCategory.clubId !== category.clubId) {
        throw new BadRequestException(`Target category not found`);
      }

      // Move products to target category
      await this.prisma.proshopProduct.updateMany({
        where: { categoryId: id },
        data: { categoryId: moveProductsTo },
      });
    }

    await this.prisma.proshopCategory.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Reorder categories
   */
  async reorderCategories(
    clubId: string,
    orderedIds: string[],
  ): Promise<ProShopCategoryType[]> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.prisma.proshopCategory.updateMany({
        where: { id: orderedIds[i], clubId },
        data: { sortOrder: i },
      });
    }

    return this.getCategories(clubId);
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  /**
   * Get products with filtering and pagination
   */
  async getProducts(
    clubId: string,
    filter?: ProShopProductFilterInput,
  ): Promise<ProShopProductConnectionType> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { clubId };

    if (filter?.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter?.isQuickAdd !== undefined) {
      where.isQuickAdd = filter.isQuickAdd;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.proshopProduct.findMany({
        where,
        orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
        skip,
        take: limit,
        include: {
          category: true,
          variants: {
            orderBy: { name: 'asc' },
          },
        },
      }),
      this.prisma.proshopProduct.count({ where }),
    ]);

    return {
      items: products.map((p) => this.mapToProduct(p)),
      total,
      page,
      limit,
      hasMore: skip + products.length < total,
    };
  }

  /**
   * Get a single product
   */
  async getProduct(id: string): Promise<ProShopProductType | null> {
    const product = await this.prisma.proshopProduct.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return product ? this.mapToProduct(product) : null;
  }

  /**
   * Get quick add products
   */
  async getQuickAddProducts(clubId: string): Promise<ProShopProductType[]> {
    const products = await this.prisma.proshopProduct.findMany({
      where: {
        clubId,
        isQuickAdd: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
      include: {
        category: true,
        variants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return products.map((p) => this.mapToProduct(p));
  }

  /**
   * Create a new product
   */
  async createProduct(
    clubId: string,
    input: CreateProShopProductInput,
  ): Promise<ProShopProductType> {
    // Verify category exists
    const category = await this.prisma.proshopCategory.findUnique({
      where: { id: input.categoryId },
    });

    if (!category || category.clubId !== clubId) {
      throw new BadRequestException(`Category not found`);
    }

    // Check for duplicate SKU if provided
    if (input.sku) {
      const existingSku = await this.prisma.proshopProduct.findFirst({
        where: { clubId, sku: input.sku },
      });

      if (existingSku) {
        throw new ConflictException(`SKU "${input.sku}" already exists`);
      }
    }

    // Create product with variants
    const product = await this.prisma.proshopProduct.create({
      data: {
        clubId,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        sku: input.sku,
        price: input.price,
        taxRate: input.taxRate ?? category.defaultTaxRate,
        taxType: input.taxType ?? category.defaultTaxType,
        useCategoryDefaults: input.useCategoryDefaults ?? true,
        isActive: input.isActive ?? true,
        isQuickAdd: input.isQuickAdd ?? false,
        variants: input.variants
          ? {
              create: input.variants.map((v) => ({
                name: v.name,
                sku: v.sku,
                priceAdjustment: v.priceAdjustment ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        variants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  /**
   * Update a product
   */
  async updateProduct(
    id: string,
    input: UpdateProShopProductInput,
  ): Promise<ProShopProductType> {
    const product = await this.prisma.proshopProduct.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    // Check for duplicate SKU if changing
    if (input.sku && input.sku !== product.sku) {
      const existingSku = await this.prisma.proshopProduct.findFirst({
        where: { clubId: product.clubId, sku: input.sku, id: { not: id } },
      });

      if (existingSku) {
        throw new ConflictException(`SKU "${input.sku}" already exists`);
      }
    }

    // Verify category if changing
    if (input.categoryId && input.categoryId !== product.categoryId) {
      const category = await this.prisma.proshopCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category || category.clubId !== product.clubId) {
        throw new BadRequestException(`Category not found`);
      }
    }

    // Handle variants update
    if (input.variants !== undefined) {
      // Get existing variant IDs
      const existingIds = product.variants.map((v) => v.id);
      const inputIds = input.variants
        .filter((v) => v.id && !v._delete)
        .map((v) => v.id!);

      // Delete variants marked for deletion or not in input
      const toDelete = [
        ...input.variants.filter((v) => v._delete && v.id).map((v) => v.id!),
        ...existingIds.filter((id) => !inputIds.includes(id)),
      ];

      if (toDelete.length > 0) {
        await this.prisma.proshopVariant.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      // Update existing variants
      for (const variant of input.variants.filter((v) => v.id && !v._delete)) {
        await this.prisma.proshopVariant.update({
          where: { id: variant.id },
          data: {
            name: variant.name,
            sku: variant.sku,
            priceAdjustment: variant.priceAdjustment ?? 0,
          },
        });
      }

      // Create new variants
      const newVariants = input.variants.filter((v) => !v.id && !v._delete);
      if (newVariants.length > 0) {
        await this.prisma.proshopVariant.createMany({
          data: newVariants.map((v) => ({
            productId: id,
            name: v.name,
            sku: v.sku,
            priceAdjustment: v.priceAdjustment ?? 0,
          })),
        });
      }
    }

    // Update product
    const updated = await this.prisma.proshopProduct.update({
      where: { id },
      data: {
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        sku: input.sku,
        price: input.price,
        taxRate: input.taxRate,
        taxType: input.taxType,
        useCategoryDefaults: input.useCategoryDefaults,
        isActive: input.isActive,
        isQuickAdd: input.isQuickAdd,
      },
      include: {
        category: true,
        variants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return this.mapToProduct(updated);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.prisma.proshopProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    // Delete variants first (cascade should handle this, but being explicit)
    await this.prisma.proshopVariant.deleteMany({
      where: { productId: id },
    });

    await this.prisma.proshopProduct.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    ids: string[],
    clubId: string,
    input: BulkUpdateProShopProductInput,
  ): Promise<ProShopProductType[]> {
    // Verify category if provided
    if (input.categoryId) {
      const category = await this.prisma.proshopCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category || category.clubId !== clubId) {
        throw new BadRequestException(`Category not found`);
      }
    }

    await this.prisma.proshopProduct.updateMany({
      where: { id: { in: ids }, clubId },
      data: {
        categoryId: input.categoryId,
        isActive: input.isActive,
        isQuickAdd: input.isQuickAdd,
      },
    });

    const products = await this.prisma.proshopProduct.findMany({
      where: { id: { in: ids } },
      include: {
        category: true,
        variants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return products.map((p) => this.mapToProduct(p));
  }

  /**
   * Toggle quick add status
   */
  async toggleProductQuickAdd(
    id: string,
    isQuickAdd: boolean,
  ): Promise<ProShopProductType> {
    const product = await this.prisma.proshopProduct.update({
      where: { id },
      data: { isQuickAdd },
      include: {
        category: true,
        variants: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private mapToCategory(category: any, productCount: number): ProShopCategoryType {
    return {
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      defaultTaxRate: Number(category.defaultTaxRate),
      defaultTaxType: category.defaultTaxType as TaxType,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      productCount,
    };
  }

  private mapToProduct(product: any): ProShopProductType {
    const category = product.category;
    const useCategoryDefaults = product.useCategoryDefaults;

    // Calculate effective tax settings
    const effectiveTaxRate = useCategoryDefaults
      ? Number(category.defaultTaxRate)
      : Number(product.taxRate);
    const effectiveTaxType = useCategoryDefaults
      ? (category.defaultTaxType as TaxType)
      : (product.taxType as TaxType);

    return {
      id: product.id,
      categoryId: product.categoryId,
      category: category
        ? {
            id: category.id,
            name: category.name,
            description: category.description || undefined,
            defaultTaxRate: Number(category.defaultTaxRate),
            defaultTaxType: category.defaultTaxType as TaxType,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
          }
        : undefined,
      name: product.name,
      description: product.description || undefined,
      sku: product.sku || undefined,
      price: Number(product.price),
      taxRate: Number(product.taxRate),
      taxType: product.taxType as TaxType,
      useCategoryDefaults: product.useCategoryDefaults,
      effectiveTaxRate,
      effectiveTaxType,
      variants: (product.variants || []).map((v: any) => this.mapToVariant(v, Number(product.price))),
      isActive: product.isActive,
      isQuickAdd: product.isQuickAdd,
    };
  }

  private mapToVariant(variant: any, basePrice: number): ProShopVariantType {
    return {
      id: variant.id,
      name: variant.name,
      sku: variant.sku || undefined,
      priceAdjustment: Number(variant.priceAdjustment),
      finalPrice: basePrice + Number(variant.priceAdjustment),
    };
  }
}
