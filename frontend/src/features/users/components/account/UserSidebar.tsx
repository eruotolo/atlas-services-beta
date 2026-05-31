'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactElement } from 'react';

import { signOut } from 'next-auth/react';

import { Avatar, Icon, Mono } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';
import Logo from '@/shared/components/layout/Logo';

interface UserSidebarProps {
    country: string;
    user: { name: string; avatar?: string | null; isPremium?: boolean };
    counts?: { servicios?: number; mensajes?: number };
}

interface NavItem {
    id: string;
    label: string;
    icon: HireIconName;
    href: string;
    badge?: string | number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

function buildSections(country: string, counts: UserSidebarProps['counts']): NavSection[] {
    const c = counts ?? {};
    return [
        {
            title: 'Mi cuenta',
            items: [
                { id: 'resumen', label: 'Resumen', icon: 'layoutDash', href: `/${country}/perfil` },
                {
                    id: 'mensajes',
                    label: 'Mensajes',
                    icon: 'inbox',
                    href: `/${country}/perfil/mensajes`,
                    badge: c.mensajes,
                },
                {
                    id: 'favoritos',
                    label: 'Favoritos',
                    icon: 'heart',
                    href: `/${country}/perfil/favoritos`,
                },
            ],
        },
        {
            title: 'Servicios',
            items: [
                {
                    id: 'publicar',
                    label: 'Publicar servicio',
                    icon: 'plus',
                    href: `/${country}/publicar`,
                },
                {
                    id: 'pro',
                    label: 'Plan Hireeo Pro',
                    icon: 'crown',
                    href: `/${country}/suscripcion-pro`,
                },
            ],
        },
        {
            title: 'Cuenta',
            items: [
                {
                    id: 'ajustes',
                    label: 'Ajustes',
                    icon: 'settings',
                    href: `/${country}/perfil/ajustes`,
                },
            ],
        },
    ];
}

function isItemActive(pathname: string, href: string, country: string): boolean {
    const base = `/${country}/perfil`;
    if (href === base) {
        return pathname === base || pathname === `${base}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarItemProps {
    item: NavItem;
    active: boolean;
}

function SidebarItem({ item, active }: SidebarItemProps): ReactElement {
    return (
        <Link
            href={item.href}
            className="mb-px flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5"
            style={{
                background: active ? 'var(--tint)' : 'transparent',
                border: active ? '1px solid var(--line)' : '1px solid transparent',
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
            {item.badge ? (
                <Mono
                    className="rounded px-1.5 py-px text-[10px] font-semibold"
                    style={{ color: 'var(--ink)', background: 'var(--accent-soft)' }}
                >
                    {item.badge}
                </Mono>
            ) : null}
        </Link>
    );
}

export function UserSidebar({ country, user, counts }: UserSidebarProps): ReactElement {
    const pathname = usePathname();
    const sections = useMemo(() => buildSections(country, counts), [country, counts]);
    const role = user.isPremium ? 'Profesional Pro' : 'Profesional';

    return (
        <aside
            className="hidden flex-col lg:flex"
            style={{
                width: 240,
                padding: '20px 14px',
                borderRight: '1px solid var(--line)',
                background: 'var(--bg)',
            }}
        >
            <div style={{ padding: '6px 8px 22px' }}>
                <Link href={`/${country}`} aria-label="Hireeo" className="inline-flex">
                    <Logo className="h-6 w-auto" />
                </Link>
            </div>

            <div
                className="mb-4 flex items-center gap-2.5 rounded-md border p-3"
                style={{
                    background: 'var(--tint)',
                    borderColor: 'var(--line)',
                }}
            >
                <Avatar name={user.name} src={user.avatar ?? undefined} size={32} />
                <div className="min-w-0 flex-1">
                    <div
                        className="truncate text-[12.5px] font-semibold"
                        style={{ color: 'var(--ink)' }}
                    >
                        {user.name}
                    </div>
                    <Mono
                        className="text-[10px] font-semibold"
                        style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}
                    >
                        {role}
                    </Mono>
                </div>
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
                        {section.title.toUpperCase()}
                    </Mono>
                    {section.items.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            active={isItemActive(pathname, item.href, country)}
                        />
                    ))}
                </div>
            ))}

            <button
                type="button"
                onClick={() => signOut({ callbackUrl: `/${country}` })}
                className="mt-auto inline-flex cursor-pointer items-center gap-2.5 px-2.5 py-3 text-[12.5px]"
                style={{ color: 'var(--sub)' }}
            >
                <Icon name="logout" size={13} stroke="var(--sub)" />
                Cerrar sesión
            </button>
        </aside>
    );
}
