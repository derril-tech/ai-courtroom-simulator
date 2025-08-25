import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum WorkspaceRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    FACILITATOR = 'facilitator',
    PARTICIPANT = 'participant',
    OBSERVER = 'observer',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: WorkspaceRole[]) => {
    return (target: any, key?: string, descriptor?: any) => {
        Reflector.defineMetadata(ROLES_KEY, roles, descriptor.value);
        return descriptor;
    };
};

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        const userRole = user.workspace_role || WorkspaceRole.OBSERVER;

        // Role hierarchy: owner > admin > facilitator > participant > observer
        const roleHierarchy = {
            [WorkspaceRole.OWNER]: 5,
            [WorkspaceRole.ADMIN]: 4,
            [WorkspaceRole.FACILITATOR]: 3,
            [WorkspaceRole.PARTICIPANT]: 2,
            [WorkspaceRole.OBSERVER]: 1,
        };

        const userRoleLevel = roleHierarchy[userRole];
        const requiredRoleLevel = Math.min(...requiredRoles.map(role => roleHierarchy[role]));

        if (userRoleLevel >= requiredRoleLevel) {
            return true;
        }

        throw new HttpException(
            `Insufficient permissions. Required: ${requiredRoles.join(' or ')}, Current: ${userRole}`,
            HttpStatus.FORBIDDEN
        );
    }
}
