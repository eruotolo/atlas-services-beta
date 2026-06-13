import { z } from 'zod';

export const detectInputSchema = z.object({
    mensaje: z
        .string()
        .min(3, 'Cuéntame un poco más sobre lo que necesitas')
        .max(500, 'El mensaje es demasiado largo'),
});

export type DetectInput = z.infer<typeof detectInputSchema>;
