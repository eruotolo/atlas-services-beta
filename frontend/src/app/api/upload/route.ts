import { type NextRequest, NextResponse } from 'next/server';

import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Rate limiter en memoria (suficiente para MVP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 10; // por minuto
const WINDOW_MS = 60000; // 60 segundos

function checkRateLimit(identifier: string, maxRequests: number, now: number): NextResponse | null {
    const userLimit = rateLimitMap.get(identifier);

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
        return null;
    }

    if (userLimit.count >= maxRequests) {
        return NextResponse.json(
            {
                error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.',
                retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
            },
            { status: 429 },
        );
    }

    userLimit.count++;
    return null;
}

function validateFiles(files: File[]): NextResponse | null {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_FILE_SIZE_MB = 3;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    for (const file of files) {
        if (!validImageTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Tipo de archivo no válido: ${file.name}` },
                { status: 400 },
            );
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                {
                    error: `El archivo ${file.name} supera el tamaño máximo de ${MAX_FILE_SIZE_MB}MB`,
                },
                { status: 400 },
            );
        }
    }

    return null;
}

async function uploadFiles(files: File[], folder: string | null): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'jpg';
        const safeFilename = `${timestamp}-${randomString}.${extension}`;
        const filename = folder ? `${folder}/${safeFilename}` : safeFilename;

        const blob = await put(filename, file, {
            access: 'public',
        });
        return blob.url;
    });

    return Promise.all(uploadPromises);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const now = Date.now();

    // Determinar identificador y límite de requests
    const identifier = session?.user?.id
        ? session.user.id
        : `ip:${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'}`;
    const maxRequests = session?.user?.id ? MAX_REQUESTS : 5;

    // Verificar rate limit
    const rateLimitError = checkRateLimit(identifier, maxRequests, now);
    if (rateLimitError) return rateLimitError;

    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const folder = formData.get('folder') as string | null;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No se proporcionaron archivos' }, { status: 400 });
        }

        // Validar archivos
        const validationError = validateFiles(files);
        if (validationError) return validationError;

        // Subir archivos
        const urls = await uploadFiles(files, folder);

        return NextResponse.json({ urls }, { status: 200 });
    } catch (error) {
        console.error('Error detallado al subir imágenes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json(
            { error: 'Error al subir imágenes', details: errorMessage },
            { status: 500 },
        );
    }
}
