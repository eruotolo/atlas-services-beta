import type { getServicioBySlug } from '@/features/services/actions';

/**
 * Tipo del servicio en su forma detallada — derivado de la action `getServicioBySlug`.
 * Incluye campos extra que no están en el listado: userEmail, userPhone, userAvatar,
 * contactos del servicio, imágenes, redes sociales, reseñas, etc.
 */
export type ServiceDetail = NonNullable<Awaited<ReturnType<typeof getServicioBySlug>>>;

export type ServiceReview = ServiceDetail['resenas'][number];
