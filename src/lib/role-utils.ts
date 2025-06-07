import type { RoleName } from '@/types/user';

// Role badge variant mapping
export function getRoleBadgeVariant(
  roleName: string
): 'destructive' | 'default' | 'secondary' | 'outline' {
  switch (roleName as RoleName) {
    case 'ADMIN':
      return 'destructive';
    case 'EXECUTIVE':
      return 'default';
    case 'TELECALLER':
      return 'secondary';
    default:
      return 'outline';
  }
}

// Role permission checks
export function hasPermission(userRole: string | null, requiredRole: RoleName): boolean {
  if (!userRole) return false;

  const roleHierarchy: Record<RoleName, number> = {
    TELECALLER: 1,
    EXECUTIVE: 2,
    ADMIN: 3,
  };

  const userLevel = roleHierarchy[userRole as RoleName] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

// Check if user is admin
export function isAdmin(userRole: string | null): boolean {
  return userRole === 'ADMIN';
}

// Check if user is executive or higher
export function isExecutiveOrHigher(userRole: string | null): boolean {
  return hasPermission(userRole, 'EXECUTIVE');
}

// Get role display name
export function getRoleDisplayName(roleName: string): string {
  const displayNames: Record<string, string> = {
    ADMIN: 'Administrator',
    EXECUTIVE: 'Executive',
    TELECALLER: 'Telecaller',
  };

  return displayNames[roleName] || roleName;
}
