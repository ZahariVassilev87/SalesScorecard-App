export enum UserRole {
  ADMIN = 'ADMIN',
  SALES_DIRECTOR = 'SALES_DIRECTOR',
  REGIONAL_SALES_MANAGER = 'REGIONAL_SALES_MANAGER',
  SALES_LEAD = 'SALES_LEAD',
  SALESPERSON = 'SALESPERSON'
}

export const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: 5,
  [UserRole.SALES_DIRECTOR]: 4,
  [UserRole.REGIONAL_SALES_MANAGER]: 3,
  [UserRole.SALES_LEAD]: 2,
  [UserRole.SALESPERSON]: 1
};

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'teams:create',
    'teams:read',
    'teams:update',
    'teams:delete',
    'regions:create',
    'regions:read',
    'regions:update',
    'regions:delete',
    'evaluations:create',
    'evaluations:read',
    'evaluations:update',
    'evaluations:delete',
    'reports:read',
    'analytics:read'
  ],
  [UserRole.SALES_DIRECTOR]: [
    'users:read',
    'teams:read',
    'regions:read',
    'regions:update',
    'evaluations:read',
    'evaluations:update',
    'reports:read',
    'analytics:read'
  ],
  [UserRole.REGIONAL_SALES_MANAGER]: [
    'users:read',
    'teams:read',
    'teams:update',
    'regions:read',
    'evaluations:create',
    'evaluations:read',
    'evaluations:update',
    'reports:read'
  ],
  [UserRole.SALES_LEAD]: [
    'users:read',
    'teams:read',
    'evaluations:create',
    'evaluations:read',
    'evaluations:update',
    'reports:read'
  ],
  [UserRole.SALESPERSON]: [
    'evaluations:read',
    'reports:read'
  ]
};

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as UserRole];
  return permissions ? permissions.includes(permission) : false;
}

export function hasRoleOrHigher(userRole: string, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}
