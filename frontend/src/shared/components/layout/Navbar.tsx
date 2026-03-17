'use client';

import type React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LayoutDashboard, LogIn, PlusCircle, Search, User as UserIcon } from 'lucide-react';

import { SubscriptionLevel, type User } from '@/shared/types/common';

import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
    user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
    const _router = useRouter();

    return (
        <nav className="border-border bg-background/80 sticky top-0 z-50 border-b shadow-sm backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="group flex items-center">
                            <Logo className="h-12 w-auto transform transition-transform duration-300 group-hover:scale-105" />
                        </Link>
                    </div>

                    <div className="hidden items-center space-x-6 md:flex">
                        <Link
                            href="/buscar"
                            className="flex items-center gap-2 font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                        >
                            <Search size={18} />
                            <span>Buscar Servicio</span>
                        </Link>

                        <Link
                            href="/publicar"
                            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 dark:shadow-none"
                        >
                            <PlusCircle size={18} />
                            <span className="font-semibold">Ofrecer Servicio</span>
                        </Link>

                        {user?.role === 'admin' && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-white transition-all hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-blue-700"
                            >
                                <LayoutDashboard size={18} />
                                <span className="font-semibold">Panel Admin</span>
                            </Link>
                        )}

                        <div className="bg-border mx-2 h-6 w-[1px]" />

                        {user ? (
                            <Link
                                href="/perfil"
                                className="bg-muted flex items-center gap-3 rounded-full border border-transparent px-3 py-1.5 text-gray-700 transition-colors hover:border-blue-100 hover:text-blue-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:text-blue-400"
                            >
                                <div className="border-border bg-background flex h-8 w-8 items-center justify-center rounded-full border shadow-sm">
                                    <UserIcon
                                        size={18}
                                        className="text-gray-500 dark:text-gray-300"
                                    />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-sm font-bold">{user.name}</span>
                                    {user.subscription === SubscriptionLevel.PREMIUM && (
                                        <span className="mt-0.5 text-[9px] font-black tracking-tighter text-blue-600 uppercase dark:text-blue-400">
                                            Miembro Pro
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="border-border hover:bg-muted flex items-center gap-2 rounded-full border-2 px-5 py-2 font-bold text-gray-700 transition-all dark:text-gray-100"
                                >
                                    <LogIn size={18} />
                                    <span>Entrar</span>
                                </Link>
                                <Link
                                    href="/registro"
                                    className="border-border bg-blue-600 hover:bg-blue-700 flex items-center gap-2 rounded-full border-2 px-5 py-2 font-bold text-white transition-all shadow-sm"
                                >
                                    <span>Registrar</span>
                                </Link>
                            </div>
                        )}

                        <ThemeToggle />
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <Link
                            href="/buscar"
                            className="flex items-center gap-1.5 p-2 text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-100"
                        >
                            <Search size={20} />
                            <span className="text-xs font-bold tracking-tight">Buscar</span>
                        </Link>

                        <Link
                            href="/publicar"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <PlusCircle size={20} />
                        </Link>

                        <Link
                            href={user ? '/perfil' : '/login'}
                            className="border-border bg-muted ml-1 flex h-10 w-10 items-center justify-center rounded-full border text-gray-600 dark:text-gray-100"
                        >
                            <UserIcon size={20} />
                        </Link>

                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
