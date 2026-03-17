import type { z } from 'zod';

import type {
    ownServiceSchema,
    ownServiceUpdateSchema,
    passwordUpdateSchema,
    profileUpdateSchema,
    userCreateSchema,
    userUpdateSchema,
} from '../schemas/userSchemas';

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
export type OwnServiceInput = z.infer<typeof ownServiceSchema>;
export type OwnServiceUpdateInput = z.infer<typeof ownServiceUpdateSchema>;

// Tipos de dominio (independientes de Prisma)
export interface Role {
    id: string;
    nombre: string;
}

export interface UserRole {
    userId: string;
    roleId: string;
    role: Role;
}

export interface Usuario {
    id: string;
    email: string;
    nombre: string;
    telefono?: string | null;
    avatar?: string | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type UserWithRoles = Usuario & {
    roles: UserRole[];
    _count: {
        servicios: number;
        calificaciones: number;
    };
};
