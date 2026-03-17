import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

const routeRoles: Record<string, string[]> = {
    '/admin': ['SuperAdministrador'],
    '/perfil': ['Usuario', 'SuperAdministrador'],
};

function checkAccess(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some((role) => userRoles.includes(role));
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Lógica de ruteo compleja
export default async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    if (token?.error === 'RefreshTokenExpired') {
        if (pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/admin')) {
        if (!token) return NextResponse.redirect(new URL('/login', req.url));
        const userRoles = (token.roles as string[]) || [];
        if (!checkAccess(userRoles, routeRoles['/admin'])) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }

    if (pathname.startsWith('/perfil')) {
        if (!token) return NextResponse.redirect(new URL('/login', req.url));
        const userRoles = (token.roles as string[]) || [];
        const requiredRoles = routeRoles[pathname] || ['Usuario', 'SuperAdministrador'];
        if (!checkAccess(userRoles, requiredRoles)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }

    if (pathname.startsWith('/publicar')) {
        if (!token) return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname === '/login' && token) {
        const userRoles = (token.roles as string[]) || [];
        if (userRoles.includes('SuperAdministrador')) {
            return NextResponse.redirect(new URL('/admin', req.url));
        }
        return NextResponse.redirect(new URL('/perfil', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/perfil/:path*', '/publicar/:path*', '/login'],
};
