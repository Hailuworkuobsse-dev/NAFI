import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { hashPassword } from '../../utils/password';
import { TenantScope } from '../../middleware/tenantScope';

export interface UserFilter {
  search?: string;
  role?: string;
  institutionId?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export class UsersService {
  async findAll(
    userId: string,
    institutionId: string | null,
    scope: TenantScope,
    filter: UserFilter = {},
    page = 1,
    limit = 20
  ) {
    const where: Record<string, unknown> = {};

    // Apply tenant scoping
    switch (scope) {
      case 'OWN':
        where.id = userId;
        break;
      case 'INSTITUTION':
        if (institutionId) {
          where.institutionId = institutionId;
        }
        break;
      case 'NATIONAL':
      case 'ALL':
        // No filtering
        break;
    }

    // Apply filters
    if (filter.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.role) {
      where.role = filter.role;
    }

    if (filter.institutionId) {
      where.institutionId = filter.institutionId;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter.isVerified !== undefined) {
      where.isVerified = filter.isVerified;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          institutionId: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        institutionId: true,
        isActive: true,
        isVerified: true,
        nafiId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async create(data: any, actorUserId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw ApiError.badRequest('Email already registered');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'USER',
        institutionId: data.institutionId,
        isVerified: data.isVerified ?? false,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        institutionId: true,
        isActive: true,
        isVerified: true,
        nafiId: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, data: any, actorUserId: string) {
    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.institutionId !== undefined) updateData.institutionId = data.institutionId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          institutionId: true,
          isActive: true,
          isVerified: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw ApiError.notFound('User not found');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw ApiError.notFound('User not found');
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: { id: true, isActive: true },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw ApiError.notFound('User not found');
      }
      throw error;
    }
  }
}

export const usersService = new UsersService();
