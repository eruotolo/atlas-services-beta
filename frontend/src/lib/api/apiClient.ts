const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

interface RequestOptions {
    token?: string;
    revalidate?: number | false;
    tags?: string[];
}

// Reintentos solo para errores transitorios (red/5xx). Nunca para 4xx (incluido 401).
const MAX_TRANSIENT_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
            const body = await response.json();
            message = body?.message ?? message;
        } catch {
            // mantener mensaje por defecto
        }
        throw new ApiError(response.status, message);
    }

    // 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

function buildFetchInit(init: RequestInit, options: RequestOptions): RequestInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        ...(init.headers as Record<string, string>),
    };

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    const nextOptions: RequestInit['next'] = {};
    if (options.revalidate !== undefined) {
        nextOptions.revalidate = options.revalidate;
    }
    if (options.tags) {
        nextOptions.tags = options.tags;
    }

    return {
        ...init,
        headers,
        next: Object.keys(nextOptions).length > 0 ? nextOptions : undefined,
    };
}

async function request<T>(
    path: string,
    init: RequestInit,
    options: RequestOptions = {},
): Promise<T> {
    const fetchInit = buildFetchInit(init, options);

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt++) {
        const isLast = attempt === MAX_TRANSIENT_RETRIES;
        try {
            const response = await fetch(`${API_BASE_URL}${path}`, fetchInit);
            // 5xx: error transitorio del servidor → reintentar (salvo último intento)
            if (response.status >= 500 && !isLast) {
                await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
                continue;
            }
            return await parseResponse<T>(response);
        } catch (error) {
            // 4xx/5xx ya resueltos: propagar sin reintentar
            if (error instanceof ApiError) {
                throw error;
            }
            // Error de red/fetch → transitorio: reintentar si quedan intentos
            lastError = error;
            if (isLast) break;
            await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new ApiError(0, 'Error de red al conectar con el backend');
}

export const apiClient = {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
        return request<T>(path, { method: 'GET' }, options);
    },
    post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
        return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, options);
    },
    patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
        return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, options);
    },
    put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
        return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, options);
    },
    delete<T>(path: string, options?: RequestOptions): Promise<T> {
        return request<T>(path, { method: 'DELETE' }, options);
    },
};
