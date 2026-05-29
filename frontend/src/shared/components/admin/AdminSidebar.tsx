'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    ArrowUpRight,
    BadgeDollarSign,
    BarChart3,
    CreditCard,
    Hammer,
    Layers,
    LayoutDashboard,
    Megaphone,
    Star,
    Users,
} from 'lucide-react';

import Logo from '@/shared/components/layout/Logo';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/admin', icon: LayoutDashboard, label: 'Resumen' },
        { href: '/admin/servicios', icon: Hammer, label: 'Servicios' },
        { href: '/admin/categorias', icon: Layers, label: 'Categorías' },
        { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
        { href: '/admin/calificaciones', icon: Star, label: 'Calificaciones' },
        { href: '/admin/interacciones', icon: BarChart3, label: 'Interacciones' },
        { href: '/admin/pagos', icon: CreditCard, label: 'Pagos y Caja' },
        { href: '/admin/sponsors', icon: Megaphone, label: 'Sponsors' },
        { href: '/admin/precios-premium', icon: BadgeDollarSign, label: 'Precios Premium' },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="hidden w-72 flex-col gap-10 border-r border-line bg-bg p-8 lg:flex">
            <div className="mb-4 flex flex-col items-center gap-5">
                <Logo className="h-9 w-auto" />
                <div className="h-px w-full bg-line" />
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black tracking-widest text-muted uppercase">
                            Plataforma
                        </p>
                        <h2 className="text-base font-black tracking-tighter text-ink italic">
                            Admin Panel
                        </h2>
                    </div>
                </div>
            </div>

            <nav className="flex flex-grow flex-col gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                            isActive(link.href)
                                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                                : 'text-muted hover:bg-tint'
                        }`}
                    >
                        <link.icon size={18} />
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-xs font-bold text-muted transition-colors hover:text-brand"
                >
                    <ArrowUpRight size={14} /> Volver a la App
                </Link>
            </div>
        </aside>
    );
}
