import { z } from 'zod';

import { RedSocialSchema } from '@/features/services/schemas/serviceSchemas';

// Password validation logic matching original: min 8, 1 uppercase, 1 special char
export const passwordSchema = z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe contener al menos un carácter especial');

export const userCreateSchema = z.object({
    email: z.string().email('Email inválido'),
    nombre: z.string().min(2, 'El nombre es requerido'),
    password: passwordSchema,
    telefono: z.string().optional().nullable(),
    roles: z.array(z.string()).min(1, 'Debe seleccionar al menos un rol'),
});

export const userUpdateSchema = z.object({
    id: z.string().min(1),
    email: z.string().email('Email inválido'),
    nombre: z.string().min(2, 'El nombre es requerido'),
    password: passwordSchema.optional().or(z.literal('')),
    telefono: z.string().optional().nullable(),
    roles: z.array(z.string()).min(1, 'Debe seleccionar al menos un rol'),
});

export const profileUpdateSchema = z.object({
    nombre: z.string().min(2, 'El nombre es requerido'),
    telefono: z.string().optional().nullable(),
});

export const passwordUpdateSchema = z
    .object({
        currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Las contraseñas nuevas no coinciden',
        path: ['confirmPassword'],
    });

export const ownServiceSchema = z.object({
    titulo: z.string().min(1, 'El título es requerido'),
    categoriasIds: z
        .array(z.string())
        .min(1, 'Debes seleccionar al menos una categoría')
        .max(3, 'Puedes seleccionar máximo 3 categorías'),
    descripcion: z.string().min(1, 'La descripción es requerida'),
    precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
    comuna: z.string().min(1, 'La comuna es requerida'),
    imagenPrincipal: z.string().optional(),
    imagenes: z.array(z.string()).optional(),
    redesSociales: z.array(RedSocialSchema).optional(),
    nombreContacto: z.string().min(1, 'El nombre de contacto es requerido'),
    emailContacto: z.string().email('Email de contacto inválido'),
    telefonoContacto: z.string().min(1, 'El teléfono de contacto es requerido'),
});

export const ownServiceUpdateSchema = ownServiceSchema.extend({
    id: z.string().min(1, 'ID es requerido'),
});
