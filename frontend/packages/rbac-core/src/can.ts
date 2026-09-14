import type { Permission } from './permissions';
import { ROLE_PERMISSIONS } from './rolePermissions';
import type { Role } from './roles';

export interface AuthSubject {
  role: Role;
  permissions?: readonly Permission[];
  scopes?: Record<string, readonly string[]>;
}

/**
 * Pure RBAC check. Framework-agnostic — used by both React and Vue.
 */
export function can(
  subject: AuthSubject | null | undefined,
  permission: Permission,
  scope?: string,
): boolean {
  if (!subject) return false;

  const rolePerms = ROLE_PERMISSIONS[subject.role];
  const hasWildcard = (rolePerms as readonly string[]).includes('*');
  
  // Get effective permissions: explicit subject permissions OR role-based permissions
  let effectivePerms: readonly Permission[] | readonly ['*'];
  if (subject.permissions && subject.permissions.length > 0) {
    effectivePerms = subject.permissions;
  } else {
    effectivePerms = rolePerms;
  }

  if (hasWildcard || effectivePerms.includes('*' as unknown as Permission)) {
    if (!scope) return true;
    return subject.scopes?.[permission]?.includes(scope) ?? true;
  }

  if (!effectivePerms.includes(permission)) return false;
  if (!scope) return true;

  return subject.scopes?.[permission]?.includes(scope) ?? false;
}
