import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña debe tener mínimo 6 caracteres'),
});

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña debe tener mínimo 6 caracteres'),
    nombre: z.string().min(2, 'Nombre debe tener mínimo 2 caracteres'),
    telefono: z
        .string()
        .min(8, 'Teléfono debe tener mínimo 8 caracteres')
        .regex(/^[0-9+\s-]+$/, 'Teléfono inválido'),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
