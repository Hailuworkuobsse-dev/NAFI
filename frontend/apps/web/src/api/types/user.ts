import type { Permission, Role } from '@nafi/rbac-core';

import type { ID, ISODate, PageParams } from './common';

export interface UserSummary {
  id: ID;
  nafiId: string;
  fullName: string;
  email: string;
  role: Role;
  institutionId?: ID;
  institutionName?: string;
  isActive: boolean;
  lastLoginAt?: ISODate;
  createdAt: ISODate;
}

export interface UserFilters extends PageParams {
  role?: Role;
  institutionId?: ID;
  isActive?: boolean;
}

export interface InviteUserInput {
  email: string;
  fullName: string;
  role: Role;
  permissions?: Permission[];
}
