import { Platform } from 'react-native';

const DEFAULT_URL =
    Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

const BASE_URL = `${(process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL).replace(/\/$/, '')}/api/v1`;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? '';

let _accessToken: string | null = null;
let _countryCode: string | null = null;
let _locale: string | null = null;
let _onRefreshNeeded: (() => Promise<string | null>) | null = null;

export function setClientToken(token: string | null): void { _accessToken = token; }
export function getClientToken(): string | null { return _accessToken; }
export function setClientCountryCode(code: string | null): void { _countryCode = code; }
export function setClientLocale(locale: string | null): void { _locale = locale; }
export function setRefreshCallback(cb: () => Promise<string | null>): void { _onRefreshNeeded = cb; }

export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// Queue of pending callbacks waiting for token refresh to complete
let _isRefreshing = false;
const _refreshQueue: Array<(token: string | null) => void> = [];

function drainQueue(token: string | null): void {
    _refreshQueue.splice(0).forEach((cb) => { cb(token); });
}

function buildUrl(path: string): string {
    const full = `${BASE_URL}${path}`;
    if (!_countryCode || full.includes('countryCode=')) return full;
    return `${full}${full.includes('?') ? '&' : '?'}countryCode=${encodeURIComponent(_countryCode)}`;
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
    };
    if (_accessToken) headers.Authorization = `Bearer ${_accessToken}`;
    if (_locale) headers['Accept-Language'] = _locale;
    return { ...headers, ...extra };
}

async function parseError(res: Response): Promise<ApiError> {
    let message = res.statusText || 'Request failed';
    try {
        const body = (await res.clone().json()) as { message?: string };
        if (body?.message) message = body.message;
    } catch {
        // ignore parse errors — use statusText
    }
    return new ApiError(res.status, message);
}

async function request<T>(
    path: string,
    init: RequestInit = {},
    isRetry = false,
): Promise<T> {
    const url = buildUrl(path);
    const res = await fetch(url, { ...init, headers: buildHeaders(init.headers as Record<string, string> | undefined) });

    // Success
    if (res.ok) return res.json() as Promise<T>;

    // Not a 401, or already retried, or no refresh handler → throw immediately
    if (res.status !== 401 || isRetry || !_onRefreshNeeded) {
        throw await parseError(res);
    }

    // 401: coordinate refresh so concurrent requests only refresh once
    if (_isRefreshing) {
        const newToken = await new Promise<string | null>((resolve) => _refreshQueue.push(resolve));
        if (!newToken) throw new ApiError(401, 'Session expired');
        return request<T>(path, init, true);
    }

    _isRefreshing = true;
    try {
        const newToken = await _onRefreshNeeded();
        _accessToken = newToken;
        drainQueue(newToken);
        if (!newToken) throw new ApiError(401, 'Session expired');
        return request<T>(path, init, true);
    } catch (err) {
        drainQueue(null);
        throw err;
    } finally {
        _isRefreshing = false;
    }
}

export const apiClient = {
    get:    <T>(path: string): Promise<T>                  => request<T>(path),
    post:   <T>(path: string, body?: unknown): Promise<T>  => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
    put:    <T>(path: string, body?: unknown): Promise<T>  => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
    patch:  <T>(path: string, body?: unknown): Promise<T>  => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
    delete: <T>(path: string): Promise<T>                  => request<T>(path, { method: 'DELETE' }),
};
