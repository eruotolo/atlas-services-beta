import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

const SUPPORTED_COUNTRIES = ['cl', 'ar', 'uy', 'es', 'us'];
const DEFAULT_COUNTRY = 'cl';

const BYPASS_PREFIXES = ['/api', '/_next', '/favicon', '/manifest', '/robots', '/sitemap'];

const LEGACY_PATHS = [
    '/buscar',
    '/publicar',
    '/login',
    '/registro',
    '/perfil',
    '/servicio',
    '/suscripcion-pro',
    '/unauthorized',
    '/admin',
    '/como-funciona',
    '/contacto',
    '/privacidad',
    '/terminos',
    '/ayuda',
    '/quienes-somos',
];

const routeRoles: Record<string, string[]> = {
    '/admin': ['SuperAdministrador'],
    '/perfil': ['Usuario', 'SuperAdministrador'],
};

function checkAccess(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some((role) => userRoles.includes(role));
}

function detectCountry(request: NextRequest): string {
    const cookie = request.cookies.get('atlas_country')?.value;
    if (cookie && SUPPORTED_COUNTRIES.includes(cookie)) return cookie;

    const cf = request.headers.get('cf-ipcountry')?.toLowerCase();
    if (cf && SUPPORTED_COUNTRIES.includes(cf)) return cf;

    const vercel = request.headers.get('x-vercel-ip-country')?.toLowerCase();
    if (vercel && SUPPORTED_COUNTRIES.includes(vercel)) return vercel;

    const lang = request.headers.get('accept-language')?.toLowerCase() ?? '';
    if (lang.includes('es-ar')) return 'ar';
    if (lang.includes('es-uy')) return 'uy';
    if (lang.includes('es-es')) return 'es';
    // Any English variant (en, en-US, en-GB, en-AU, etc.) routes to US
    if (/\ben/.test(lang)) return 'us';

    return DEFAULT_COUNTRY;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Lógica de ruteo compleja
export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    if (pathname === '/') {
        const country = detectCountry(req);
        return NextResponse.redirect(new URL(`/${country}`, req.url), 302);
    }

    const isLegacy = LEGACY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isLegacy) {
        return NextResponse.redirect(new URL(`/cl${pathname}`, req.url), 301);
    }

    const segments = pathname.split('/');
    const firstSegment = segments[1];

    if (!SUPPORTED_COUNTRIES.includes(firstSegment)) {
        return NextResponse.next();
    }

    const rawToken = await getToken({ req, secret: process.env.AUTH_SECRET });
    const pathWithoutCountry = `/${segments.slice(2).join('/')}`;

    // Token con error se trata como no autenticado (evita loops de redirect)
    const token = rawToken?.error ? null : rawToken;

    if (rawToken?.error && !pathWithoutCountry.startsWith('/login')) {
        return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
    }

    if (pathWithoutCountry.startsWith('/admin')) {
        if (!token) return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
        const userRoles = (token.roles as string[]) ?? [];
        if (!checkAccess(userRoles, routeRoles['/admin'])) {
            return NextResponse.redirect(new URL(`/${firstSegment}/unauthorized`, req.url));
        }
        if (
            !userRoles.includes('SuperAdministrador') &&
            token.adminCountries &&
            !(token.adminCountries as string[]).includes(firstSegment)
        ) {
            return NextResponse.redirect(new URL(`/${firstSegment}/unauthorized`, req.url));
        }
    }

    if (pathWithoutCountry.startsWith('/perfil')) {
        if (!token) return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
        const userRoles = (token.roles as string[]) ?? [];
        if (!checkAccess(userRoles, routeRoles['/perfil'])) {
            return NextResponse.redirect(new URL(`/${firstSegment}/unauthorized`, req.url));
        }
    }

    if (pathWithoutCountry.startsWith('/publicar') && !token) {
        return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
    }

    if (pathWithoutCountry === '/login' && token) {
        const userRoles = (token.roles as string[]) ?? [];
        if (userRoles.includes('SuperAdministrador')) {
            return NextResponse.redirect(new URL(`/${firstSegment}/admin`, req.url));
        }
        return NextResponse.redirect(new URL(`/${firstSegment}/perfil`, req.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-atlas-lang', firstSegment === 'us' ? 'en' : 'es');
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
