export enum UserRole {
  ADMIN = 'ADMIN',
  REGIONAL_MANAGER = 'REGIONAL_MANAGER',
  SALES_LEAD = 'SALES_LEAD',
  SALESPERSON = 'SALESPERSON',
}

export const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: 4,
  [UserRole.REGIONAL_MANAGER]: 3,
  [UserRole.SALES_LEAD]: 2,
  [UserRole.SALESPERSON]: 1,
};

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'organizations:create',
    'organizations:read',
    'organizations:update',
    'organizations:delete',
    'evaluations:create',
    'evaluations:read',
    'evaluations:update',
    'evaluations:delete',
    'analytics:read',
    'admin:access',
  ],
  [UserRole.REGIONAL_MANAGER]: [
    'users:read',
    'users:update',
    'organizations:read',
    'organizations:update',
    'evaluations:create',
    'evaluations:read',
    'evaluations:update',
    'analytics:read',
  ],
  [UserRole.SALES_LEAD]: [
    'users:read',
    'organizations:read',
    'evaluations:create',
    'evaluations:read',
    'evaluations:update',
    'analytics:read',
  ],
  [UserRole.SALESPERSON]: [
    'evaluations:read',
    'evaluations:update',
  ],
};
