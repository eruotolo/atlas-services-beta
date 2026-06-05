import type { ReactElement } from 'react';

import { Btn, Icon, Mono } from '@/shared/components/hireeo';

type Props = { params: Promise<{ country: string }> };

export default async function UnauthorizedPage({ params }: Props): Promise<ReactElement> {
    const { country } = await params;

    return (
        <section
            className="flex items-center justify-center px-6 py-20 sm:px-10"
            style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--bg)' }}
        >
            <div className="mx-auto w-full max-w-md text-center">
                <div className="mb-7 flex justify-center">
                    <div
                        className="flex h-20 w-20 items-center justify-center rounded-full"
                        style={{ background: 'var(--danger-soft)' }}
                    >
                        <Icon name="shield" size={32} stroke="var(--danger)" />
                    </div>
                </div>

                <Mono
                    className="text-[11px] font-semibold"
                    style={{ color: 'var(--accent)', letterSpacing: '0.15em' }}
                >
                    — 403 · ACCESO RESTRINGIDO
                </Mono>

                <h1
                    className="m-0 mt-4 mb-4"
                    style={{
                        fontSize: 34,
                        fontWeight: 500,
                        letterSpacing: '-0.025em',
                        color: 'var(--ink)',
                    }}
                >
                    No puedes ver esto.
                </h1>

                <p
                    className="m-0 mb-8 text-[14.5px]"
                    style={{ color: 'var(--sub)', lineHeight: 1.65 }}
                >
                    Tu cuenta no tiene permisos para entrar a esta sección. Si crees que es un
                    error, contacta al equipo de Hireeo.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Btn variant="primary" iconRight="arrow" href={`/${country}`}>
                        Volver al inicio
                    </Btn>
                    <Btn variant="secondary" icon="mail" href={`/${country}/contacto`}>
                        Contactar soporte
                    </Btn>
                </div>
            </div>
        </section>
    );
}
