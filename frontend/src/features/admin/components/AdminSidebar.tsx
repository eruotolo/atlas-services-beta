'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactElement } from 'react';

import { signOut } from 'next-auth/react';

import { Avatar, Icon, Mono } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';

interface AdminUser {
    name: string;
    email: string;
    avatar?: string | null;
}

interface AdminSidebarProps {
    country: string;
    user: AdminUser;
}

interface NavItem {
    id: string;
    label: string;
    icon: HireIconName;
    href: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

function buildSections(country: string): NavSection[] {
    return [
        {
            title: 'OPERACIÓN',
            items: [
                { id: 'overview', label: 'Resumen', icon: 'layoutDash', href: `/${country}/admin` },
                {
                    id: 'servicios',
                    label: 'Servicios',
                    icon: 'briefcase',
                    href: `/${country}/admin/servicios`,
                },
                {
                    id: 'usuarios',
                    label: 'Usuarios',
                    icon: 'users',
                    href: `/${country}/admin/usuarios`,
                },
                {
                    id: 'calificaciones',
                    label: 'Calificaciones',
                    icon: 'star',
                    href: `/${country}/admin/calificaciones`,
                },
                {
                    id: 'interacciones',
                    label: 'Interacciones',
                    icon: 'trend',
                    href: `/${country}/admin/interacciones`,
                },
            ],
        },
        {
            title: 'CATÁLOGO',
            items: [
                {
                    id: 'categorias',
                    label: 'Categorías',
                    icon: 'pkg',
                    href: `/${country}/admin/categorias`,
                },
                {
                    id: 'sponsors',
                    label: 'Sponsors',
                    icon: 'bell',
                    href: `/${country}/admin/sponsors`,
                },
            ],
        },
        {
            title: 'PAGOS',
            items: [
                {
                    id: 'precios',
                    label: 'Precios Premium',
                    icon: 'crown',
                    href: `/${country}/admin/precios-premium`,
                },
                {
                    id: 'pagos',
                    label: 'Pagos',
                    icon: 'card',
                    href: `/${country}/admin/pagos`,
                },
            ],
        },
    ];
}

function isActiveLink(pathname: string, href: string, country: string): boolean {
    const base = `/${country}/admin`;
    if (href === base) {
        return pathname === base || pathname === `${base}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminNavLinkProps {
    item: NavItem;
    active: boolean;
}

function AdminNavLink({ item, active }: AdminNavLinkProps): ReactElement {
    return (
        <Link
            href={item.href}
            className="mb-px flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5"
            style={{
                background: active ? 'white' : 'transparent',
                border: active ? '1px solid var(--line)' : '1px solid transparent',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.03)' : 'none',
            }}
        >
            <div className="flex items-center gap-2.5">
                <Icon
                    name={item.icon}
                    size={14}
                    stroke={active ? 'var(--ink)' : 'var(--sub)'}
                />
                <span
                    className="text-[13px]"
                    style={{
                        color: active ? 'var(--ink)' : 'var(--sub)',
                        fontWeight: active ? 600 : 500,
                    }}
                >
                    {item.label}
                </span>
            </div>
        </Link>
    );
}

export function AdminSidebar({ country, user }: AdminSidebarProps): ReactElement {
    const pathname = usePathname();
    const sections = useMemo(() => buildSections(country), [country]);

    return (
        <aside
            className="hidden flex-col lg:flex"
            style={{
                width: 240,
                background: 'var(--tint)',
                borderRight: '1px solid var(--line)',
                padding: '20px 14px',
                gap: 4,
            }}
        >
            <div
                className="flex items-center justify-between"
                style={{ padding: '6px 10px 18px' }}
            >
                <Link href={`/${country}`} aria-label="Hireeo" className="inline-flex">
                    <Image
                        src="/logo.png"
                        alt="Hireeo"
                        width={2371}
                        height={938}
                        className="h-5 w-auto"
                    />
                </Link>
                <Mono
                    className="rounded font-semibold"
                    style={{
                        fontSize: 10,
                        padding: '3px 7px',
                        background: 'var(--ink)',
                        color: 'var(--bg)',
                        letterSpacing: '0.06em',
                    }}
                >
                    ADMIN
                </Mono>
            </div>

            <div
                className="mb-4 flex items-center justify-between rounded-md border"
                style={{
                    padding: 10,
                    background: 'var(--bg)',
                    borderColor: 'var(--line)',
                }}
            >
                <div>
                    <Mono
                        className="text-[10px] font-semibold"
                        style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}
                    >
                        SCOPE
                    </Mono>
                    <div
                        className="mt-0.5 text-[13px] font-semibold"
                        style={{ color: 'var(--ink)' }}
                    >
                        {country.toUpperCase()}
                    </div>
                </div>
                <Icon name="chevronDown" size={14} stroke="var(--muted)" />
            </div>

            {sections.map((section) => (
                <div key={section.title} className="mb-3">
                    <Mono
                        className="block text-[9.5px] font-semibold"
                        style={{
                            color: 'var(--muted)',
                            letterSpacing: '0.12em',
                            padding: '6px 10px',
                        }}
                    >
                        {section.title}
                    </Mono>
                    {section.items.map((item) => (
                        <AdminNavLink
                            key={item.id}
                            item={item}
                            active={isActiveLink(pathname, item.href, country)}
                        />
                    ))}
                </div>
            ))}

            <div
                className="mt-auto pt-4"
                style={{ borderTop: '1px solid var(--line)' }}
            >
                <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
                    <Avatar name={user.name} src={user.avatar ?? undefined} size={28} />
                    <div className="min-w-0 flex-1">
                        <div
                            className="truncate text-[12.5px] font-semibold"
                            style={{ color: 'var(--ink)' }}
                        >
                            {user.name}
                        </div>
                        <Mono className="text-[10px]" style={{ color: 'var(--muted)' }}>
                            superadmin
                        </Mono>
                    </div>
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: `/${country}` })}
                        aria-label="Cerrar sesión"
                        className="inline-flex cursor-pointer"
                    >
                        <Icon name="logout" size={14} stroke="var(--muted)" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
