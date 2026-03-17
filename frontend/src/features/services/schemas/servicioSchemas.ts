import { z } from 'zod';

export const TipoRedSocialEnum = z.enum([
    'WEBSITE',
    'FACEBOOK',
    'INSTAGRAM',
    'LINKEDIN',
    'TIKTOK',
    'TWITTER',
    'YOUTUBE',
    'OTRO',
]);

export const RedSocialSchema = z.object({
    tipo: TipoRedSocialEnum,
    url: z.string().url('URL inválida'),
});

export const servicioCreateSchema = z.object({
    usuarioId: z.string().min(1, 'Usuario es requerido'),
    titulo: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
    categoriasIds: z
        .array(z.string())
        .min(1, 'Debes seleccionar al menos una categoría')
        .max(3, 'Puedes seleccionar máximo 3 categorías'),
    descripcion: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
    precio: z.coerce.number().min(0, 'Precio debe ser mayor o igual a 0'),
    comuna: z.string().min(1, 'Comuna es requerida'),
    imagenPrincipal: z.string().optional(),
    imagenes: z.array(z.string()).optional(),
    redesSociales: z.array(RedSocialSchema).optional(),
    nombreContacto: z.string().optional(),
    emailContacto: z.string().email('Email inválido').optional().or(z.literal('')),
    telefonoContacto: z.string().optional(),
});

export const servicioUpdateSchema = z.object({
    id: z.string().min(1, 'ID es requerido'),
    titulo: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
    categoriasIds: z
        .array(z.string())
        .min(1, 'Debes seleccionar al menos una categoría')
        .max(3, 'Puedes seleccionar máximo 3 categorías'),
    descripcion: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
    precio: z.coerce.number().min(0, 'Precio debe ser mayor o igual a 0'),
    comuna: z.string().min(1, 'Comuna es requerida'),
    imagenPrincipal: z.string().optional(),
    imagenes: z.array(z.string()).optional(),
    redesSociales: z.array(RedSocialSchema).optional(),
    nombreContacto: z.string().optional(),
    emailContacto: z.string().email('Email inválido').optional().or(z.literal('')),
    telefonoContacto: z.string().optional(),
});

// Schema para generación de descripción con IA
export const generarDescripcionIASchema = z.object({
    titulo: z
        .string()
        .min(3, 'El título debe tener al menos 3 caracteres')
        .max(200, 'El título es demasiado largo'),
    categorias: z
        .array(z.string())
        .min(1, 'Debes proporcionar al menos una categoría')
        .max(3, 'Máximo 3 categorías'),
});

export type GenerarDescripcionIAInput = z.infer<typeof generarDescripcionIASchema>;
