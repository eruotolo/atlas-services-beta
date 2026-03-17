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
            <div className="mb-4 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none">
                    <LayoutDashboard size={32} />
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Plataforma
                    </p>
                    <h2 className="text-xl font-black tracking-tighter text-gray-900 italic dark:text-white">
                        Admin Panel
                    </h2>
                </div>
            </div>

            <nav className="flex flex-grow flex-col gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                            isActive(link.href)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
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
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                >
                    <ArrowUpRight size={14} /> Volver a la App
                </Link>
            </div>
        </aside>
    );
}
