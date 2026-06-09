'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ArrowRight, CheckCircle2, PartyPopper } from 'lucide-react';

export default function Paso6Exito() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    // Efecto para el contador
    useEffect(() => {
        if (countdown === 0) {
            router.push('/profile');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, router]);

    return (
        <div className="flex flex-col items-center justify-center bg-transparent py-12 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={64} />
            </div>

            <h2 className="mb-4 text-4xl font-black text-ink">
                ¡Pago Exitoso!
            </h2>

            <div className="mb-8 flex items-center justify-center gap-2 text-xl font-medium text-brand">
                <PartyPopper size={24} />
                <span>Tu servicio ya es Premium y está destacado</span>
            </div>

            <p className="mb-12 max-w-md text-sub">
                Hemos recibido tu pago correctamente. Tu anuncio aparecerá en los primeros lugares
                de búsqueda de inmediato.
            </p>

            <div className="mb-8 rounded-2xl bg-tint px-8 py-4">
                <p className="text-sm font-medium text-muted">
                    Serás redirigido a tu perfil en{' '}
                    <span className="font-black text-brand">
                        {countdown} segundos
                    </span>
                </p>
            </div>

            <button
                type="button"
                onClick={() => router.push('/profile')}
                className="btn-primary flex cursor-pointer items-center gap-2 rounded-2xl px-8 py-4"
            >
                Ir a mi Perfil ahora
                <ArrowRight size={20} />
            </button>
        </div>
    );
}
