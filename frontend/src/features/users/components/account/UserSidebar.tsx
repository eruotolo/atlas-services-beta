'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useRef, useEffect, type ReactElement } from 'react';

import { signOut } from 'next-auth/react';

import { Avatar, Icon, Mono } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';
import Logo from '@/shared/components/layout/Logo';
import type { Dictionary } from '@/lib/i18n/types';

interface UserSidebarProps {
    country: string;
    dictionary?: Dictionary['account']['sidebar'];
    scopeLabel?: string;
    user: { name: string; email: string; avatar?: string | null; isPremium?: boolean };
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

function buildSections(
    country: string,
    counts: UserSidebarProps['counts'],
    dict?: Dictionary['account']['sidebar'],
): NavSection[] {
    const c = counts ?? {};
    return [
        {
            title: dict?.sectionAccount ?? 'MI CUENTA',
            items: [
                { id: 'resumen', label: dict?.overview ?? 'Resumen', icon: 'layoutDash', href: `/${country}/profile` },
                {
                    id: 'mensajes',
                    label: dict?.messages ?? 'Mensajes',
                    icon: 'inbox',
                    href: `/${country}/profile/messages`,
                    badge: c.mensajes,
                },
                {
                    id: 'cotizaciones',
                    label: dict?.quotes ?? 'Cotizaciones',
                    icon: 'fileText',
                    href: `/${country}/profile/quotes`,
                },
                {
                    id: 'favoritos',
                    label: dict?.favorites ?? 'Favoritos',
                    icon: 'heart',
                    href: `/${country}/profile/favorites`,
                },
                {
                    id: 'direcciones',
                    label: (dict as any)?.addresses ?? 'Direcciones',
                    icon: 'pin',
                    href: `/${country}/profile/addresses`,
                },
            ],
        },
        {
            title: dict?.sectionServices ?? 'SERVICIOS',
            items: [
                {
                    id: 'mis-servicios',
                    label: dict?.myServices ?? 'Mis servicios',
                    icon: 'briefcase',
                    href: `/${country}/profile/services`,
                },
                {
                    id: 'publicar',
                    label: dict?.publishService ?? 'Publicar servicio',
                    icon: 'plus',
                    href: `/${country}/publish`,
                },
                {
                    id: 'pro',
                    label: dict?.hireeoPro ?? 'Plan Hireeo Pro',
                    icon: 'crown',
                    href: `/${country}/pricing`,
                },
            ],
        },
        {
            title: dict?.sectionClients ?? 'CLIENTES',
            items: [
                {
                    id: 'leads',
                    label: dict?.availableLeads ?? 'Leads disponibles',
                    icon: 'bolt',
                    href: `/${country}/profile/leads`,
                },
                {
                    id: 'verificacion',
                    label: dict?.idVerification ?? 'Verificación ID',
                    icon: 'shieldCheck',
                    href: `/${country}/profile/verification`,
                },
            ],
        },
        {
            title: dict?.sectionSettings ?? 'CONFIGURACIÓN',
            items: [
                {
                    id: 'ajustes',
                    label: dict?.settings ?? 'Ajustes',
                    icon: 'settings',
                    href: `/${country}/profile/settings`,
                },
            ],
        },
    ];
}

function isItemActive(pathname: string, href: string, country: string): boolean {
    const base = `/${country}/profile`;
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
            className="mb-px flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 transition-colors"
            style={{
                background: active ? 'var(--bg)' : 'transparent',
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
            {item.badge ? (
                <Mono
                    className="rounded px-1.5 py-px text-[10px] font-semibold text-ink"
                    style={{ background: 'var(--accent-soft)' }}
                >
                    {item.badge}
                </Mono>
            ) : null}
        </Link>
    );
}

export function UserSidebar({ country, user, counts, dictionary, scopeLabel = 'GLOBAL' }: UserSidebarProps): ReactElement {
    const pathname = usePathname();
    const sections = useMemo(() => buildSections(country, counts, dictionary), [country, counts, dictionary]);
    
    const roleLabel = user.isPremium 
        ? (dictionary?.rolePro ?? 'Profesional Pro') 
        : (dictionary?.roleClient ?? 'Profesional');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <aside
            className="hidden flex-col lg:flex bg-tint"
            style={{
                width: 240,
                borderRight: '1px solid var(--line)',
                padding: '20px 14px',
                gap: 4,
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflowY: 'auto',
            }}
        >
            <div className="flex items-center justify-between" style={{ padding: '6px 10px 18px' }}>
                <Link href={`/${country}`} aria-label="Hireeo" className="inline-flex">
                    <Logo className="h-5 w-auto" />
                </Link>
                <Mono
                    className="rounded font-semibold tracking-[0.06em] bg-ink text-bg"
                    style={{ fontSize: 10, padding: '3px 7px' }}
                >
                    CLIENT
                </Mono>
            </div>

            <div
                className="mb-4 flex items-center justify-between rounded-md border bg-bg border-line"
                style={{ padding: 10 }}
            >
                <div>
                    <Mono className="text-[10px] font-semibold tracking-[0.06em] text-muted">
                        REGION
                    </Mono>
                    <div className="mt-0.5 text-[13px] font-semibold text-ink">{scopeLabel}</div>
                </div>
                <Icon name="globe" size={14} stroke="var(--muted)" />
            </div>

            {sections.map((section) => (
                <div key={section.title} className="mb-3">
                    <Mono
                        className="block text-[9.5px] font-semibold text-muted"
                        style={{
                            letterSpacing: '0.12em',
                            padding: '6px 10px',
                        }}
                    >
                        {section.title}
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

            <div className="mt-auto pt-4 border-t border-line relative" ref={menuRef}>
                {isMenuOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-full rounded-xl border border-line bg-bg/90 p-1.5 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: `/${country}` })}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
                        >
                            <Icon name="logout" size={14} stroke="currentColor" />
                            {dictionary?.signOutLabel ?? 'Cerrar sesión'}
                        </button>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-tint"
                >
                    <Avatar name={user.name} src={user.avatar ?? undefined} size={36} />
                    <div className="min-w-0 flex-1 text-left flex flex-col justify-center gap-1">
                        <div className="truncate text-[13.5px] font-semibold leading-none text-ink">
                            {user.name}
                        </div>
                        <span className="truncate text-[11px] leading-none text-muted">{roleLabel}</span>
                    </div>
                    <Icon name="chevronUp" size={16} stroke="var(--sub)" />
                </button>
            </div>
        </aside>
    );
}
