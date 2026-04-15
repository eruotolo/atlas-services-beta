'use client';

import type React from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { LayoutDashboard, LogIn, PlusCircle, Search, User as UserIcon } from 'lucide-react';

import { useDictionary } from '@/lib/i18n/useDictionary';
import { SubscriptionLevel, type User } from '@/shared/types/common';

import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
    user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    const dict = useDictionary();

    return (
        <nav className="border-border bg-background/80 sticky top-0 z-50 border-b shadow-sm backdrop-blur-md">
            <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center">
                        <Link href={`/${country}`} className="group flex items-center">
                            <Logo className="h-12 w-auto transform transition-transform duration-300 group-hover:scale-105" />
                        </Link>
                    </div>

                    <div className="hidden items-center space-x-6 md:flex">
                        <Link
                            href={`/${country}/buscar`}
                            className="flex items-center gap-2 font-medium text-gray-500 transition-colors hover:text-brand dark:text-gray-100 dark:hover:text-brand-light"
                        >
                            <Search size={18} />
                            <span>{dict.nav.search}</span>
                        </Link>

                        <Link
                            href={`/${country}/publicar`}
                            className="btn-primary flex items-center gap-2 rounded-full px-6 py-2.5"
                        >
                            <PlusCircle size={18} />
                            <span className="font-semibold">{dict.nav.publish}</span>
                        </Link>

                        {user?.role === 'admin' && (
                            <Link
                                href={`/${country}/admin`}
                                className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-white transition-all hover:bg-brand dark:bg-gray-800 dark:hover:bg-brand-hover"
                            >
                                <LayoutDashboard size={18} />
                                <span className="font-semibold">{dict.nav.adminPanel}</span>
                            </Link>
                        )}

                        <div className="bg-border mx-2 h-6 w-[1px]" />

                        {user ? (
                            <Link
                                href={`/${country}/perfil`}
                                className="bg-muted flex items-center gap-3 rounded-full border border-transparent px-3 py-1.5 text-gray-700 transition-colors hover:border-brand/20 hover:text-brand dark:bg-gray-900 dark:text-gray-100 dark:hover:text-brand-light"
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
                                        <span className="mt-0.5 text-[9px] font-black tracking-tighter text-brand uppercase dark:text-brand-light">
                                            {dict.nav.memberPro}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href={`/${country}/login`}
                                className="border-border hover:bg-muted flex items-center gap-2 rounded-full border-2 px-5 py-2 font-bold text-gray-700 transition-all dark:text-gray-100"
                            >
                                <LogIn size={18} />
                                <span>{dict.nav.login}</span>
                            </Link>
                        )}

                        <ThemeToggle />
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <Link
                            href={`/${country}/buscar`}
                            className="flex items-center gap-1.5 p-2 text-gray-500 transition-colors hover:text-brand dark:text-gray-100"
                        >
                            <Search size={20} />
                            <span className="text-xs font-bold tracking-tight">{dict.nav.searchMobile}</span>
                        </Link>

                        <Link
                            href={`/${country}/publicar`}
                            className="btn-primary flex h-10 w-10 items-center justify-center rounded-full"
                        >
                            <PlusCircle size={20} />
                        </Link>

                        <Link
                            href={user ? `/${country}/perfil` : `/${country}/login`}
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
