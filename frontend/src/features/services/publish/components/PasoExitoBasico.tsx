'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { CheckCircle2, Eye, Home, PartyPopper } from 'lucide-react';

interface PasoExitoBasicoProps {
    slug: string;
}

export default function PasoExitoBasico({ slug }: PasoExitoBasicoProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    // Countdown automático a /servicio/[slug]
    useEffect(() => {
        if (countdown === 0) {
            router.push(`/servicio/${slug}`);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, router, slug]);

    return (
        <div className="flex flex-col items-center justify-center bg-transparent py-12 text-center">
            {/* Ícono de éxito */}
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={64} />
            </div>

            {/* Título */}
            <h2 className="mb-4 text-4xl font-black text-ink">
                ¡Servicio Publicado!
            </h2>

            {/* Mensaje de éxito */}
            <div className="mb-8 flex items-center justify-center gap-2 text-xl font-medium text-green-600">
                <PartyPopper size={24} />
                <span>Tu servicio ya está visible para clientes</span>
            </div>

            <p className="mb-12 max-w-md text-sub">
                Tu anuncio básico gratuito ha sido publicado exitosamente. Los clientes de Chiloé ya
                pueden encontrarte y contactarte.
            </p>

            {/* Countdown */}
            <div className="mb-8 rounded-2xl bg-tint px-8 py-4">
                <p className="text-sm font-medium text-muted">
                    Serás redirigido a tu servicio en{' '}
                    <span className="font-black text-brand">
                        {countdown} segundos
                    </span>
                </p>
            </div>

            {/* Botones de acción */}
            <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
                <button
                    onClick={() => router.push('/')}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-tint px-6 py-4 font-bold text-sub transition-all hover:bg-line active:scale-95"
                    type="button"
                >
                    <Home size={20} />
                    Volver al inicio
                </button>

                <button
                    onClick={() => router.push(`/servicio/${slug}`)}
                    className="btn-primary flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-4"
                    type="button"
                >
                    <Eye size={20} />
                    Ver servicio
                </button>
            </div>
        </div>
    );
}
