import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, hasPermission, hasRoleOrHigher } from './roles.enum';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = Reflector.createDecorator<UserRole[]>();
export const RequirePermission = Reflector.createDecorator<string>();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check role-based access
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => user.role === role);
      if (!hasRole) {
        throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
      }
    }

    // Check permission-based access
    if (requiredPermission) {
      const hasRequiredPermission = hasPermission(user.role, requiredPermission);
      if (!hasRequiredPermission) {
        throw new ForbiddenException(`Access denied. Required permission: ${requiredPermission}`);
      }
    }

    return true;
  }
}

@Injectable()
export class RoleHierarchyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredRole = request.params.requiredRole || request.body.requiredRole;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (requiredRole && !hasRoleOrHigher(user.role, requiredRole as UserRole)) {
      throw new ForbiddenException(`Access denied. Required role level: ${requiredRole}`);
    }

    return true;
  }
}
