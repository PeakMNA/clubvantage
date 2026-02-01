import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Prisma, ProductType } from '@prisma/client';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  CreateModifierGroupInput,
  UpdateModifierGroupInput,
} from './product.input';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  async getCategories(clubId: string, includeInactive = false) {
    return this.prisma.productCategory.findMany({
      where: {
        clubId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategory(id: string) {
    return this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });
  }

  async createCategory(clubId: string, input: CreateProductCategoryInput) {
    return this.prisma.productCategory.create({
      data: {
        clubId,
        ...input,
      },
    });
  }

  async updateCategory(id: string, input: UpdateProductCategoryInput) {
    return this.prisma.productCategory.update({
      where: { id },
      data: input,
    });
  }

  async deleteCategory(id: string, moveProductsTo?: string) {
    if (moveProductsTo) {
      await this.prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: moveProductsTo },
      });
    }
    await this.prisma.productCategory.delete({ where: { id } });
    return true;
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  async getProducts(clubId: string, filter?: ProductFilterInput) {
    const where: Prisma.ProductWhereInput = {
      clubId,
      ...(filter?.categoryId && { categoryId: filter.categoryId }),
      ...(filter?.productType && { productType: filter.productType }),
      ...(filter?.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter?.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { sku: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const take = filter?.first || 50;

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: take + 1,
        ...(filter?.after && { cursor: { id: filter.after }, skip: 1 }),
        include: {
          category: true,
          variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          modifierGroups: {
            include: {
              modifierGroup: {
                include: {
                  modifiers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
                },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [{ sortPriority: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    const hasNextPage = products.length > take;
    const edges = products.slice(0, take).map((product) => ({
      node: this.mapProduct(product),
      cursor: product.id,
    }));

    return {
      edges,
      totalCount,
      hasNextPage,
      hasPreviousPage: !!filter?.after,
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return product ? this.mapProduct(product) : null;
  }

  async createProduct(clubId: string, input: CreateProductInput) {
    const { variants, modifierGroupIds, ...productData } = input;

    // Determine product type based on variants
    const productType = variants?.length
      ? ProductType.VARIABLE
      : input.productType || ProductType.SIMPLE;

    const product = await this.prisma.product.create({
      data: {
        clubId,
        ...productData,
        productType,
        variants: variants?.length
          ? {
              create: variants.map((v, i) => ({
                ...v,
                sortOrder: v.sortOrder ?? i,
              })),
            }
          : undefined,
        modifierGroups: modifierGroupIds?.length
          ? {
              create: modifierGroupIds.map((groupId, i) => ({
                modifierGroupId: groupId,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        variants: true,
        modifierGroups: {
          include: {
            modifierGroup: { include: { modifiers: true } },
          },
        },
      },
    });

    return this.mapProduct(product);
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const { variants, modifierGroupIds, ...productData } = input;

    const product = await this.prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        variants: true,
        modifierGroups: {
          include: {
            modifierGroup: { include: { modifiers: true } },
          },
        },
      },
    });

    return this.mapProduct(product);
  }

  async deleteProduct(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return true;
  }

  // ============================================================================
  // MODIFIER GROUPS
  // ============================================================================

  async getModifierGroups(clubId: string) {
    return this.prisma.modifierGroup.findMany({
      where: { clubId, isActive: true },
      include: {
        modifiers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createModifierGroup(clubId: string, input: CreateModifierGroupInput) {
    const { modifiers, ...groupData } = input;

    return this.prisma.modifierGroup.create({
      data: {
        clubId,
        ...groupData,
        modifiers: modifiers?.length
          ? {
              create: modifiers.map((m, i) => ({
                ...m,
                sortOrder: m.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: { modifiers: true },
    });
  }

  async updateModifierGroup(id: string, input: UpdateModifierGroupInput) {
    const { modifiers, ...groupData } = input;

    return this.prisma.modifierGroup.update({
      where: { id },
      data: groupData,
      include: { modifiers: true },
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private mapProduct(product: any) {
    return {
      ...product,
      basePrice: Number(product.basePrice),
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      taxRate: Number(product.taxRate),
      hasVariants: product.variants?.length > 0,
      hasModifiers: product.modifierGroups?.length > 0,
      isInStock: !product.trackInventory || (product.stockQuantity ?? 0) > 0,
      modifierGroups: product.modifierGroups?.map((pmg: any) => ({
        ...pmg.modifierGroup,
        modifiers: pmg.modifierGroup.modifiers.map((m: any) => ({
          ...m,
          priceAdjustment: Number(m.priceAdjustment),
        })),
      })),
      variants: product.variants?.map((v: any) => ({
        ...v,
        priceAdjustment: Number(v.priceAdjustment),
      })),
    };
  }
}
