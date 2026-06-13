'use server';

import { revalidatePath } from 'next/cache';

import { getServerSession } from 'next-auth';

import { ApiError, apiClient } from '@/lib/api/apiClient';
import type { BackendAuthResponse, BackendCreateServiceDto } from '@/lib/api/backendTypes';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function verificarOCrearUsuario(formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const email = (formData.get('email') as string)?.toLowerCase().trim();
    const telefono = formData.get('telefono') as string;

    if (!nombre || !email) return { error: 'Nombre y email son requeridos' };

    try {
        const data = await apiClient.post<BackendAuthResponse>('/auth/register', {
            email,
            name: nombre,
            phone: telefono ?? null,
            // El backend genera una contraseña temporal para invitados
            password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
            isGuest: true,
        });

        return {
            success: true,
            usuario: {
                id: data.user.id,
                nombre: data.user.name,
                email: data.user.email,
                telefono: data.user.phone,
            },
            existia: false,
            passwordEnviado: true,
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            return {
                error: 'Ya existe una cuenta con este email. Por favor, inicia sesión para publicar.',
                debeIniciarSesion: true,
            };
        }

        console.error('Error al verificar/crear usuario:', error);
        return { error: 'Error al procesar la solicitud' };
    }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Manejo de formulario complejo con múltiples campos
export async function publicarServicioPublico(formData: FormData) {
    const session = await getServerSession(authOptions);
    let usuarioId: string;

    if (session?.user?.id) {
        usuarioId = session.user.id;
    } else {
        const usuarioIdFromForm = formData.get('usuarioId') as string;
        if (!usuarioIdFromForm) {
            return { error: 'No autorizado. Debes iniciar sesión para publicar.' };
        }
        usuarioId = usuarioIdFromForm;
    }

    const titulo = formData.get('titulo') as string;
    const categoriasIdsJson = formData.get('categoriasIds') as string;
    const descripcion = formData.get('descripcion') as string;
    const precio = formData.get('precio') as string;
    const comuna = formData.get('comuna') as string;
    const imagenPrincipal = formData.get('imagenPrincipal') as string;
    const imagenesJson = formData.get('imagenes') as string;
    const redesSocialesJson = formData.get('redesSociales') as string;
    const nombreContacto = formData.get('nombreContacto') as string;
    const emailContacto = formData.get('emailContacto') as string;
    const telefonoContacto = formData.get('telefonoContacto') as string;

    if (!titulo || !categoriasIdsJson || !descripcion || !precio || !comuna) {
        return { error: 'Todos los campos son requeridos' };
    }

    let categoriasIds: string[] = [];
    try {
        categoriasIds = categoriasIdsJson ? JSON.parse(categoriasIdsJson) : [];
        if (!Array.isArray(categoriasIds) || categoriasIds.length === 0) {
            return { error: 'Debes seleccionar al menos una categoría' };
        }
    } catch {
        return { error: 'Formato de categorías inválido' };
    }

    let imagenes: string[] = [];
    try {
        imagenes = imagenesJson ? JSON.parse(imagenesJson) : [];
    } catch {
        imagenes = [];
    }

    let redesSociales: Array<{ tipo: string; url: string }> = [];
    try {
        redesSociales = redesSocialesJson ? JSON.parse(redesSocialesJson) : [];
    } catch {
        redesSociales = [];
    }

    try {
        const payload: BackendCreateServiceDto = {
            userId: usuarioId,
            title: titulo,
            description: descripcion,
            price: Number.parseFloat(precio),
            commune: comuna,
            mainImage: imagenPrincipal || null,
            images: imagenes,
            categoryIds: categoriasIds,
            socialNetworks: redesSociales.map((rs) => ({ type: rs.tipo, url: rs.url })),
            contactName: nombreContacto || null,
            contactEmail: emailContacto || null,
            contactPhone: telefonoContacto || null,
        };

        const servicio = await apiClient.post<{ id: string; title: string; slug: string }>(
            '/services',
            payload,
            { token: session?.user?.backendToken },
        );

        revalidatePath('/');
        return {
            success: true,
            servicio: { id: servicio.id, titulo: servicio.title, slug: servicio.slug },
        };
    } catch (error) {
        console.error('Error al crear servicio:', error);
        return { error: 'Error al publicar servicio' };
    }
}

/**
 * Server Action: Genera descripción de servicio usando IA
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Manejo de IA con múltiples validaciones y casos de error
export async function generarDescripcionIA(titulo: string, categorias: string[]) {
    try {
        const { generarDescripcionIASchema } = await import('../../schemas/serviceSchemas');
        const { generateServiceDescription } = await import('@/shared/lib/ai/geminiService');

        const validacion = generarDescripcionIASchema.safeParse({
            titulo: titulo.trim(),
            categorias,
        });

        if (!validacion.success) {
            const primerError = validacion.error.issues[0]?.message;
            return { error: primerError || 'Datos inválidos para generar descripción' };
        }

        // Obtener nombres de categorías desde el backend
        const response = await apiClient.get<{ data: Array<{ id: string; name: string }> }>(
            `/categorias?ids=${categorias.join(',')}`,
        );

        const categoriasData = response.data ?? [];

        if (categoriasData.length === 0) {
            return { error: 'No se encontraron categorías válidas' };
        }

        const nombresCategoria = categoriasData.map((cat) => cat.name);

        const descripcionGenerada = await generateServiceDescription(
            validacion.data.titulo,
            nombresCategoria,
        );

        if (!descripcionGenerada) {
            return {
                error: 'No se pudo generar la descripción. Por favor, intenta nuevamente o escríbela manualmente.',
            };
        }

        if (descripcionGenerada.length < 10) {
            return {
                error: 'La descripción generada es demasiado corta. Por favor, intenta nuevamente.',
            };
        }

        return {
            success: true,
            descripcion: descripcionGenerada,
        };
    } catch (error) {
        console.error('Error en generarDescripcionIA:', error);

        if (error instanceof Error) {
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                return {
                    error: 'El servicio de IA está temporalmente ocupado. Por favor, intenta en unos segundos.',
                };
            }

            if (error.message.includes('401') || error.message.includes('API key')) {
                return {
                    error: 'Error de configuración. Por favor, contacta al administrador.',
                };
            }
        }

        return {
            error: 'Error al generar descripción. Por favor, intenta nuevamente o escríbela manualmente.',
        };
    }
}
