import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserRole } from '../users/enums/user-role.enum';

export enum Permission {
  // User Management
  USER_CREATE = 'USER_CREATE',
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_DEACTIVATE = 'USER_DEACTIVATE',
  
  // Organization Management
  ORG_CREATE = 'ORG_CREATE',
  ORG_READ = 'ORG_READ',
  ORG_UPDATE = 'ORG_UPDATE',
  ORG_DELETE = 'ORG_DELETE',
  
  // Team Management
  TEAM_CREATE = 'TEAM_CREATE',
  TEAM_READ = 'TEAM_READ',
  TEAM_UPDATE = 'TEAM_UPDATE',
  TEAM_DELETE = 'TEAM_DELETE',
  
  // Region Management
  REGION_CREATE = 'REGION_CREATE',
  REGION_READ = 'REGION_READ',
  REGION_UPDATE = 'REGION_UPDATE',
  REGION_DELETE = 'REGION_DELETE',
  
  // Salesperson Management
  SALESPERSON_CREATE = 'SALESPERSON_CREATE',
  SALESPERSON_READ = 'SALESPERSON_READ',
  SALESPERSON_UPDATE = 'SALESPERSON_UPDATE',
  SALESPERSON_DELETE = 'SALESPERSON_DELETE',
  
  // Evaluation Management
  EVALUATION_CREATE = 'EVALUATION_CREATE',
  EVALUATION_READ = 'EVALUATION_READ',
  EVALUATION_UPDATE = 'EVALUATION_UPDATE',
  EVALUATION_DELETE = 'EVALUATION_DELETE',
  EVALUATION_SUBMIT = 'EVALUATION_SUBMIT',
  EVALUATION_APPROVE = 'EVALUATION_APPROVE',
  EVALUATION_REJECT = 'EVALUATION_REJECT',
  
  // Analytics & Reports
  ANALYTICS_READ = 'ANALYTICS_READ',
  REPORTS_GENERATE = 'REPORTS_GENERATE',
  REPORTS_EXPORT = 'REPORTS_EXPORT',
  
  // Audit & Security
  AUDIT_READ = 'AUDIT_READ',
  SECURITY_MANAGE = 'SECURITY_MANAGE',
  
  // System Administration
  SYSTEM_CONFIGURE = 'SYSTEM_CONFIGURE',
  SYSTEM_MONITOR = 'SYSTEM_MONITOR',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  scopes: {
    own?: boolean; // Can only access own data
    team?: boolean; // Can access team data
    region?: boolean; // Can access region data
    organization?: boolean; // Can access organization data
    global?: boolean; // Can access all data
  };
}

@Injectable()
export class RBACService {
  private readonly rolePermissions: RolePermissions[] = [
    {
      role: UserRole.ADMIN,
      permissions: Object.values(Permission),
      scopes: { global: true },
    },
    {
      role: UserRole.MANAGER,
      permissions: [
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.TEAM_CREATE,
        Permission.TEAM_READ,
        Permission.TEAM_UPDATE,
        Permission.TEAM_DELETE,
        Permission.SALESPERSON_CREATE,
        Permission.SALESPERSON_READ,
        Permission.SALESPERSON_UPDATE,
        Permission.SALESPERSON_DELETE,
        Permission.EVALUATION_CREATE,
        Permission.EVALUATION_READ,
        Permission.EVALUATION_UPDATE,
        Permission.EVALUATION_DELETE,
        Permission.EVALUATION_SUBMIT,
        Permission.EVALUATION_APPROVE,
        Permission.EVALUATION_REJECT,
        Permission.ANALYTICS_READ,
        Permission.REPORTS_GENERATE,
        Permission.REPORTS_EXPORT,
        Permission.AUDIT_READ,
      ],
      scopes: { organization: true },
    },
    {
      role: UserRole.SUPERVISOR,
      permissions: [
        Permission.USER_READ,
        Permission.TEAM_READ,
        Permission.SALESPERSON_READ,
        Permission.EVALUATION_CREATE,
        Permission.EVALUATION_READ,
        Permission.EVALUATION_UPDATE,
        Permission.EVALUATION_SUBMIT,
        Permission.ANALYTICS_READ,
        Permission.REPORTS_GENERATE,
        Permission.REPORTS_EXPORT,
      ],
      scopes: { team: true },
    },
    {
      role: UserRole.SALESPERSON,
      permissions: [
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.EVALUATION_READ,
        Permission.EVALUATION_CREATE,
        Permission.EVALUATION_UPDATE,
        Permission.EVALUATION_SUBMIT,
      ],
      scopes: { own: true },
    },
  ];

  constructor(private prisma: PrismaService) {}

  async hasPermission(
    userId: string,
    permission: Permission,
    resourceId?: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        team: true,
      },
    });

    if (!user) {
      return false;
    }

    const rolePermission = this.rolePermissions.find(
      (rp) => rp.role === user.role,
    );

    if (!rolePermission) {
      return false;
    }

    if (!rolePermission.permissions.includes(permission)) {
      return false;
    }

    // Check scope-based access
    return this.checkScopeAccess(user, rolePermission, resourceId);
  }

  async checkResourceAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: Permission,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        team: true,
      },
    });

    if (!user) {
      return false;
    }

    const rolePermission = this.rolePermissions.find(
      (rp) => rp.role === user.role,
    );

    if (!rolePermission || !rolePermission.permissions.includes(action)) {
      return false;
    }

    // Check specific resource access based on type
    switch (resourceType) {
      case 'user':
        return this.checkUserAccess(user, resourceId, rolePermission);
      case 'team':
        return this.checkTeamAccess(user, resourceId, rolePermission);
      case 'organization':
        return this.checkOrganizationAccess(user, resourceId, rolePermission);
      case 'evaluation':
        return this.checkEvaluationAccess(user, resourceId, rolePermission);
      case 'salesperson':
        return this.checkSalespersonAccess(user, resourceId, rolePermission);
      default:
        return false;
    }
  }

  private checkScopeAccess(
    user: any,
    rolePermission: RolePermissions,
    resourceId?: string,
  ): boolean {
    if (rolePermission.scopes.global) {
      return true;
    }

    if (rolePermission.scopes.organization && user.organizationId) {
      return true;
    }

    if (rolePermission.scopes.team && user.teamId) {
      return true;
    }

    if (rolePermission.scopes.own) {
      return resourceId === user.id;
    }

    return false;
  }

  private async checkUserAccess(
    user: any,
    targetUserId: string,
    rolePermission: RolePermissions,
  ): Promise<boolean> {
    if (rolePermission.scopes.global) {
      return true;
    }

    if (rolePermission.scopes.own && targetUserId === user.id) {
      return true;
    }

    if (rolePermission.scopes.team || rolePermission.scopes.organization) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        include: { team: true },
      });

      if (!targetUser) {
        return false;
      }

      if (rolePermission.scopes.organization && 
          targetUser.organizationId === user.organizationId) {
        return true;
      }

      if (rolePermission.scopes.team && 
          targetUser.teamId === user.teamId) {
        return true;
      }
    }

    return false;
  }

  private async checkTeamAccess(
    user: any,
    teamId: string,
    rolePermission: RolePermissions,
  ): Promise<boolean> {
    if (rolePermission.scopes.global) {
      return true;
    }

    if (rolePermission.scopes.organization) {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
      });

      return team?.organizationId === user.organizationId;
    }

    if (rolePermission.scopes.team && teamId === user.teamId) {
      return true;
    }

    return false;
  }

  private checkOrganizationAccess(
    user: any,
    organizationId: string,
    rolePermission: RolePermissions,
  ): Promise<boolean> {
    if (rolePermission.scopes.global) {
      return true;
    }

    return organizationId === user.organizationId;
  }

  private async checkEvaluationAccess(
    user: any,
    evaluationId: string,
    rolePermission: RolePermissions,
  ): Promise<boolean> {
    if (rolePermission.scopes.global) {
      return true;
    }

    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        salesperson: {
          include: { team: true },
        },
      },
    });

    if (!evaluation) {
      return false;
    }

    if (rolePermission.scopes.own && evaluation.salespersonId === user.id) {
      return true;
    }

    if (rolePermission.scopes.team && 
        evaluation.salesperson.teamId === user.teamId) {
      return true;
    }

    if (rolePermission.scopes.organization && 
        evaluation.salesperson.organizationId === user.organizationId) {
      return true;
    }

    return false;
  }

  private async checkSalespersonAccess(
    user: any,
    salespersonId: string,
    rolePermission: RolePermissions,
  ): Promise<boolean> {
    if (rolePermission.scopes.global) {
      return true;
    }

    if (rolePermission.scopes.own && salespersonId === user.id) {
      return true;
    }

    if (rolePermission.scopes.team || rolePermission.scopes.organization) {
      const salesperson = await this.prisma.salesperson.findUnique({
        where: { id: salespersonId },
        include: { team: true },
      });

      if (!salesperson) {
        return false;
      }

      if (rolePermission.scopes.organization && 
          salesperson.organizationId === user.organizationId) {
        return true;
      }

      if (rolePermission.scopes.team && 
          salesperson.teamId === user.teamId) {
        return true;
      }
    }

    return false;
  }

  getRolePermissions(role: UserRole): Permission[] {
    const rolePermission = this.rolePermissions.find((rp) => rp.role === role);
    return rolePermission?.permissions || [];
  }

  getAllRolePermissions(): RolePermissions[] {
    return this.rolePermissions;
  }
}

