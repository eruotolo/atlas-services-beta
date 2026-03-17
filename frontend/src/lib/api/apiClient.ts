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

async function request<T>(
    path: string,
    init: RequestInit,
    options: RequestOptions = {},
): Promise<T> {
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

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        next: Object.keys(nextOptions).length > 0 ? nextOptions : undefined,
    });

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
