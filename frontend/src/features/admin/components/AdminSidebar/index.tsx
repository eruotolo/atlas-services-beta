'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useRef, useEffect, type ReactElement } from 'react';

import { signOut } from 'next-auth/react';

import { Avatar, Icon, Mono } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';
import Logo from '@/shared/components/layout/Logo';
import Modal from '@/shared/components/admin/Modal';
import { AdminProfileForm } from '@/features/admin/components/AdminProfileForm';
import { AdminPasswordForm } from '@/features/admin/components/AdminPasswordForm';
import type { Dictionary } from '@/lib/i18n/types';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    telefono?: string | null;
    avatar?: string | null;
    roles?: string[];
}

interface AdminSidebarProps {
    user: AdminUser;
    basePath?: string;
    dictionary?: Dictionary['admin']['sidebar'];
    scopeLabel?: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: HireIconName;
    href: string;
}

function isActiveLink(pathname: string, href: string, basePath: string): boolean {
    if (href === basePath) {
        return pathname === basePath || pathname === `${basePath}/`;
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
                background: active ? 'var(--bg)' : 'transparent',
                border: active ? '1px solid var(--line)' : '1px solid transparent',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.03)' : 'none',
            }}
        >
            <div className="flex items-center gap-2.5">
                <Icon name={item.icon} size={14} stroke={active ? 'var(--ink)' : 'var(--sub)'} />
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

export function AdminSidebar({ user, basePath = '/config', dictionary, scopeLabel = 'GLOBAL' }: AdminSidebarProps): ReactElement {
    const pathname = usePathname();
    const isSuperAdmin = user.roles?.includes('SuperAdministrador') ?? false;

    const roleLabel = useMemo(
        () => (isSuperAdmin ? 'SuperAdministrador' : 'Administrador'),
        [isSuperAdmin],
    );

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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

    const sections = useMemo(() => [
        {
            id: 'ops',
            title: dictionary?.sectionOps ?? 'OVERVIEW & ANALYTICS',
            items: [
                { id: 'overview',       label: dictionary?.overview ?? 'Resumen',           icon: 'layoutDash' as HireIconName, href: basePath },
                { id: 'interacciones',  label: dictionary?.interactions ?? 'Interacciones', icon: 'trend' as HireIconName,      href: `${basePath}/interactions` },
            ],
        },
        {
            id: 'core',
            title: dictionary?.sectionCatalog ?? 'GESTIÓN CORE',
            items: [
                { id: 'usuarios',       label: dictionary?.users ?? 'Usuarios',         icon: 'users' as HireIconName,     href: `${basePath}/users` },
                { id: 'servicios',      label: dictionary?.services ?? 'Servicios',     icon: 'briefcase' as HireIconName, href: `${basePath}/services` },
                { id: 'calificaciones', label: dictionary?.ratings ?? 'Calificaciones', icon: 'star' as HireIconName,      href: `${basePath}/ratings` },
            ],
        },
        {
            id: 'monetization',
            title: dictionary?.sectionPayments ?? 'MONETIZACIÓN',
            items: [
                { id: 'pagos',    label: dictionary?.payments ?? 'Pagos',           icon: 'card' as HireIconName,  href: `${basePath}/payments` },
                { id: 'precios',  label: dictionary?.prices ?? 'Precios Premium',   icon: 'crown' as HireIconName, href: `${basePath}/premium-prices` },
                { id: 'sponsors', label: dictionary?.sponsors ?? 'Sponsors',        icon: 'bell' as HireIconName,  href: `${basePath}/sponsors` },
            ],
        },
        {
            id: 'platform',
            title: 'PLATAFORMA',
            items: [
                { id: 'categorias', label: dictionary?.categories ?? 'Categorías', icon: 'pkg' as HireIconName,   href: `${basePath}/categories` },
                ...(basePath === '/config' ? [{ id: 'countries', label: 'Países', icon: 'globe' as HireIconName, href: `${basePath}/countries` }] : []),
            ],
        },
    ], [dictionary, basePath]);

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
                <Link href="/" aria-label="Hireeo" className="inline-flex">
                    <Logo className="h-5 w-auto" />
                </Link>
                <Mono
                    className="rounded font-semibold tracking-[0.06em] bg-ink text-bg"
                    style={{ fontSize: 10, padding: '3px 7px' }}
                >
                    CONFIG
                </Mono>
            </div>

            <div
                className="mb-4 flex items-center justify-between rounded-md border bg-bg border-line"
                style={{ padding: 10 }}
            >
                <div>
                    <Mono className="text-[10px] font-semibold tracking-[0.06em] text-muted">
                        SCOPE
                    </Mono>
                    <div className="mt-0.5 text-[13px] font-semibold text-ink">{scopeLabel}</div>
                </div>
                <Icon name={basePath === '/config' ? 'globe' : 'pin'} size={14} stroke="var(--muted)" />
            </div>

            {sections.map((section) => (
                <div key={section.id} className="mb-3">
                    <Mono
                        className="block text-[9.5px] font-semibold text-muted"
                        style={{ letterSpacing: '0.12em', padding: '6px 10px' }}
                    >
                        {section.title}
                    </Mono>
                    {section.items.map((item) => (
                        <AdminNavLink
                            key={item.id}
                            item={item}
                            active={isActiveLink(pathname, item.href, basePath)}
                        />
                    ))}
                </div>
            ))}

            <div className="mt-auto pt-4 border-t border-line relative" ref={menuRef}>
                {isMenuOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-full rounded-xl border border-line bg-bg/90 p-1.5 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsProfileModalOpen(true);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-tint"
                        >
                            <Icon name="user" size={14} stroke="var(--ink)" />
                            Mi Perfil
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsPasswordModalOpen(true);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-tint"
                        >
                            <Icon name="key" size={14} stroke="var(--ink)" />
                            Seguridad
                        </button>
                        <div className="my-1 h-px w-full bg-line" />
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
                        >
                            <Icon name="logout" size={14} stroke="currentColor" />
                            {dictionary?.signOutLabel ?? 'Cerrar Sesión'}
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

            {isProfileModalOpen && (
                <Modal 
                    isOpen={isProfileModalOpen} 
                    onClose={() => setIsProfileModalOpen(false)}
                    title="Editar Perfil"
                >
                    <p className="mb-6 mt-0 text-[13px] text-sub">Modifica tu información personal y foto de perfil.</p>
                    <AdminProfileForm
                        usuario={{
                            id: user.id,
                            nombre: user.name,
                            email: user.email,
                            telefono: user.telefono ?? '',
                            avatar: user.avatar ?? null,
                        }}
                        onSuccess={() => setIsProfileModalOpen(false)}
                        onCancel={() => setIsProfileModalOpen(false)}
                    />
                </Modal>
            )}

            {isPasswordModalOpen && (
                <Modal 
                    isOpen={isPasswordModalOpen} 
                    onClose={() => setIsPasswordModalOpen(false)}
                    title="Cambiar Contraseña"
                >
                    <p className="mb-6 mt-0 text-[13px] text-sub">Actualiza la contraseña de tu cuenta administrativa.</p>
                    <AdminPasswordForm
                        onSuccess={() => setIsPasswordModalOpen(false)}
                        onCancel={() => setIsPasswordModalOpen(false)}
                    />
                </Modal>
            )}
        </aside>
    );
}
