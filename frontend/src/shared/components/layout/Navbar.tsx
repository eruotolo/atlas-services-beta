'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactElement } from 'react';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import { COUNTRY_CONFIG } from '@/features/geo/lib/countryUtils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { Btn, Icon, Mono } from '@/shared/components/hireeo';
import { SubscriptionLevel, type User } from '@/shared/types/common';

import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
    user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }: NavbarProps): ReactElement => {
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    const dict = useDictionary();
    const config = COUNTRY_CONFIG[country] ?? COUNTRY_CONFIG.cl;
    const countryCode = country.toUpperCase();
    const link = useCountryLink();

    const navItems = [
        { href: link('/buscar'), label: dict.nav.search },
        { href: link('/como-funciona'), label: dict.nav.howItWorks },
        { href: link('/suscripcion-pro'), label: dict.nav.pricing },
        { href: link('/quienes-somos'), label: dict.nav.about },
        { href: link('/publicar'), label: 'Soy profesional' },
    ];

    return (
        <header
            className="sticky top-0 z-50 border-b backdrop-blur-md"
            style={{
                borderColor: 'var(--line)',
                background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
            }}
        >
            <div className="mx-auto flex h-16 max-w-site items-center justify-between px-6 sm:px-10 lg:px-14">
                <div className="flex items-center gap-9">
                    <Link
                        href={link('')}
                        aria-label="Hireeo"
                        className="flex items-center"
                    >
                        <Logo className="h-8 w-auto" />
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-[13.5px] font-medium transition-colors hover:opacity-80"
                                style={{ color: 'var(--sub)' }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="hidden items-center gap-3.5 md:flex">
                    <span
                        aria-hidden
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px]"
                        style={{ background: 'var(--tint)', color: 'var(--sub)' }}
                    >
                        <Icon name="globe" size={11} />
                        <Mono className="font-semibold" style={{ color: 'var(--ink)' }}>
                            {countryCode}
                        </Mono>
                        <span>· {config.currency}</span>
                    </span>

                    {user?.role === 'admin' ? (
                        <Link href={link('/admin')}>
                            <Btn size="sm" variant="ghost" icon="layoutDash">
                                {dict.nav.adminPanel}
                            </Btn>
                        </Link>
                    ) : null}

                    {user ? (
                        <Link
                            href={link('/perfil')}
                            className="inline-flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-tint"
                        >
                            <span
                                className="flex h-7 w-7 items-center justify-center rounded-full border"
                                style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
                            >
                                <Icon name="user" size={14} />
                            </span>
                            <span className="flex flex-col items-start leading-none">
                                <span
                                    className="text-[12.5px] font-semibold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    {user.name}
                                </span>
                                {user.subscription === SubscriptionLevel.PREMIUM ? (
                                    <Mono
                                        className="mt-0.5 text-[9px] font-semibold"
                                        style={{
                                            color: 'var(--accent)',
                                            letterSpacing: '0.1em',
                                        }}
                                    >
                                        {dict.nav.memberPro}
                                    </Mono>
                                ) : null}
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href={link('/login')}
                            className="text-[13px] font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--sub)' }}
                        >
                            {dict.nav.login}
                        </Link>
                    )}

                    <Link href={link('/publicar')}>
                        <Btn size="sm" variant="primary" iconRight="arrow">
                            {dict.nav.startCta}
                        </Btn>
                    </Link>

                    <ThemeToggle />
                </div>

                <div className="flex items-center gap-1.5 md:hidden">
                    <Link
                        href={link('/buscar')}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-tint"
                        aria-label={dict.nav.searchMobile}
                        style={{ color: 'var(--sub)' }}
                    >
                        <Icon name="search" size={18} />
                    </Link>
                    <Link href={link('/publicar')}>
                        <Btn size="sm" variant="primary" icon="plus" aria-label={dict.nav.publish}>
                            <span className="sr-only">{dict.nav.publish}</span>
                        </Btn>
                    </Link>
                    <Link
                        href={user ? link('/perfil') : link('/login')}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-tint"
                        aria-label={user ? user.name : dict.nav.login}
                        style={{
                            borderColor: 'var(--line)',
                            color: 'var(--sub)',
                        }}
                    >
                        <Icon name="user" size={18} />
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
