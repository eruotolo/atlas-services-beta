'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

import Logo from '@/shared/components/layout/Logo';

interface AdminHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const pathname = usePathname();

    const country = pathname.split('/')[1] ?? 'cl';

    const titles: Record<string, string> = {
        [`/${country}/admin`]: 'Bienvenido, Admin',
        [`/${country}/admin/servicios`]: 'Gestión de Servicios',
        [`/${country}/admin/usuarios`]: 'Gestión de Usuarios',
        [`/${country}/admin/categorias`]: 'Gestión de Categorías',
        [`/${country}/admin/calificaciones`]: 'Gestión de Reseñas',
        [`/${country}/admin/pagos`]: 'Historial de Pagos',
        [`/${country}/admin/sponsors`]: 'Gestión de Sponsors',
        [`/${country}/admin/precios-premium`]: 'Configuración de Precios',
    };

    return (
        <header className="mb-12 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-6">
                <Link href={`/${country}`} className="shrink-0 lg:hidden">
                    <Logo className="h-9 w-auto" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        {titles[pathname] || 'Panel Admin'}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-gray-500 italic dark:text-gray-400">
                        Administra tu plataforma de servicios desde un solo lugar.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {user?.name || 'Admin Local'}
                    </p>
                    <p className="text-[10px] font-black tracking-widest text-brand uppercase dark:text-brand-light">
                        Control Maestro
                    </p>
                </div>
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-brand/10 shadow-sm dark:border-white/10 dark:bg-gray-800">
                    {user?.image ? (
                        <Image src={user.image} alt="Admin" fill className="object-cover" />
                    ) : (
                        <span className="text-lg font-black text-brand dark:text-brand-light">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: `/${country}/login`, redirect: true })}
                    className="flex cursor-pointer items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    title="Cerrar Sesión"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Salir</span>
                </button>
            </div>
        </header>
    );
}
