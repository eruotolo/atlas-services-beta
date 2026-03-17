import { z } from 'zod';

export const contactSchema = z.object({
    nombre: z.string().min(2, 'El nombre es requerido'),
    email: z.string().email('El correo electrónico no es válido'),
    celular: z.string().min(8, 'El celular es requerido'),
    asunto: z.string().min(3, 'El asunto es requerido'),
    mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export type ContactInput = z.infer<typeof contactSchema>;
