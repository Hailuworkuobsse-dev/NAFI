import type { Prisma } from '@prisma/client';

import { ROLE_PERMISSIONS, type Role } from '@nafi/rbac-core';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';
import { generateNafiId } from '@/utils/nafiId';
import { hashPassword } from '@/utils/password';

function serialize(u: Prisma.StakeholderGetPayload<object>) {
  return {
    id: u.id,
    nafiId: u.nafiId,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    institutionId: u.institutionId ?? undefined,
    institutionName: u.institutionName ?? undefined,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt?.toISOString(),
    createdAt: u.createdAt.toISOString(),
  };
}

export async function list(filters: {
  role?: string;
  institutionId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.StakeholderWhereInput = {};
  if (filters.role) where.role = filters.role as never;
  if (filters.institutionId) where.institutionId = filters.institutionId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const [items, total] = await Promise.all([
    prisma.stakeholder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stakeholder.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const u = await prisma.stakeholder.findUnique({ where: { id } });
  if (!u) throw ApiError.notFound('User not found');
  return serialize(u);
}

export async function invite(input: { email: string; fullName: string; role: string }) {
  const existing = await prisma.stakeholder.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('User already exists');

  const passwordHash = await hashPassword(`Temp-${Math.random().toString(36).slice(2)}`);

  let nafiId = generateNafiId();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.stakeholder.findUnique({ where: { nafiId } });
    if (!clash) break;
    nafiId = generateNafiId();
  }

  const u = await prisma.stakeholder.create({
    data: {
      nafiId,
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: input.role as never,
    },
  });

  // Ensure the permission list is derived cleanly for the response
  const perms = ROLE_PERMISSIONS[input.role as Role];

  return { ...serialize(u), permissions: perms };
}

export async function deactivate(id: string) {
  const u = await prisma.stakeholder.update({
    where: { id },
    data: { isActive: false },
  });
  return serialize(u);
}

export async function reactivate(id: string) {
  const u = await prisma.stakeholder.update({
    where: { id },
    data: { isActive: true },
  });
  return serialize(u);
}
