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
        <aside className="hidden w-72 flex-col gap-10 border-r border-gray-100 bg-white p-8 lg:flex dark:border-white/5 dark:bg-gray-950/50 dark:backdrop-blur-xl">
            <div className="mb-4 flex flex-col items-center gap-5">
                <Logo className="h-9 w-auto" />
                <div className="h-px w-full bg-gray-100 dark:bg-white/5" />
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30 dark:shadow-none">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase dark:text-gray-500">
                            Plataforma
                        </p>
                        <h2 className="text-base font-black tracking-tighter text-gray-900 italic dark:text-white">
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
                                ? 'bg-brand text-white shadow-lg shadow-brand/30 dark:shadow-none'
                                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
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
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 transition-colors hover:text-brand dark:text-gray-500 dark:hover:text-brand-light"
                >
                    <ArrowUpRight size={14} /> Volver a la App
                </Link>
            </div>
        </aside>
    );
}
