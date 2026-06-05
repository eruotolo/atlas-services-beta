import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { Avatar, Mono } from '@/shared/components/hireeo';
import Logo from '@/shared/components/layout/Logo';

interface AuthShellProps {
    side?: 'right' | 'left';
    country: string;
    children: ReactNode;
}

const REQUEST_BARS = [8, 12, 18, 14, 22, 28, 24, 32, 28, 36, 30, 34] as const;

export function AuthShell({
    side = 'right',
    country,
    children,
}: AuthShellProps): ReactElement {
    const formOrder = side === 'right' ? 'order-1 lg:order-1' : 'order-1 lg:order-2';
    const visualOrder = side === 'right' ? 'order-2 lg:order-2' : 'order-2 lg:order-1';
    const countryName = (
        COUNTRY_SEO_CONFIG[country]?.countryName ?? country
    ).toUpperCase();

    return (
        <div
            className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2"
            style={{ background: 'var(--bg)', color: 'var(--ink)' }}
        >
            <div className={`flex flex-col px-8 py-10 sm:px-12 lg:px-16 ${formOrder}`}>
                <div className="mb-12 flex items-center justify-between">
                    <Link href={`/${country}`} aria-label="Hireeo" className="inline-flex">
                        <Logo className="h-7 w-auto" />
                    </Link>
                    <Mono
                        className="text-[11px]"
                        style={{ color: 'var(--sub)', letterSpacing: '0.08em' }}
                    >
                        HIREEO 2.0 · BETA
                    </Mono>
                </div>

                <div className="flex-1">{children}</div>

                <div
                    className="mt-8 flex items-center justify-between pt-8 text-[11.5px]"
                    style={{ color: 'var(--muted)' }}
                >
                    <Mono>© 2026 HIREEO · BUILT FOR LATAM</Mono>
                    <div className="flex gap-4">
                        <Link href={`/${country}/terminos`}>Términos</Link>
                        <Link href={`/${country}/privacidad`}>Privacidad</Link>
                        <Link href={`/${country}/ayuda`}>Ayuda</Link>
                    </div>
                </div>
            </div>

            <div
                className={`relative hidden flex-col justify-between overflow-hidden p-14 lg:flex ${visualOrder}`}
                style={{ background: '#0A0A0A', color: '#FAFAFA' }}
            >
                <div
                    aria-hidden
                    className="absolute h-[600px] w-[600px] rounded-full"
                    style={{
                        top: -200,
                        right: -100,
                        background:
                            'radial-gradient(circle, color-mix(in srgb, var(--accent) 40%, transparent), transparent 65%)',
                        filter: 'blur(40px)',
                    }}
                />
                <div className="relative z-[1]">
                    <Mono
                        className="text-[11px] font-semibold"
                        style={{
                            color: 'var(--accent-bright)',
                            letterSpacing: '0.2em',
                        }}
                    >
                        — TESTIMONIO
                    </Mono>
                    <p
                        className="m-0 mt-5 max-w-[480px]"
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            lineHeight: 1.25,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        “Llevo doce años con la libreta de teléfonos llena. Hireeo la cambió por un
                        calendario lleno.”
                    </p>
                    <div className="mt-7 flex items-center gap-3">
                        <Avatar name="Marcelo Águila" size={36} />
                        <div>
                            <div className="text-[13px] font-semibold">Marcelo Águila</div>
                            <div
                                className="text-[11.5px]"
                                style={{ color: 'rgba(255,255,255,0.6)' }}
                            >
                                Gasfíter · {countryName}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="relative z-[1] rounded-xl border p-5"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <Mono
                        className="text-[10px]"
                        style={{
                            color: 'rgba(255,255,255,0.5)',
                            letterSpacing: '0.1em',
                        }}
                    >
                        SOLICITUDES HOY · {countryName}
                    </Mono>
                    <div className="mt-3 flex items-baseline justify-between">
                        <div
                            style={{
                                fontSize: 28,
                                fontWeight: 500,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            4.281
                        </div>
                        <span className="text-[11px]" style={{ color: '#7FE5A7' }}>
                            ↑ +12%
                        </span>
                    </div>
                    <div className="mt-4 flex h-9 items-end gap-[3px]">
                        {REQUEST_BARS.map((h, i) => (
                            <div
                                key={`bar-${i}-${h}`}
                                className="flex-1 rounded-[2px]"
                                style={{
                                    height: `${h}px`,
                                    background: `rgba(255,255,255,${0.2 + i / 24})`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
