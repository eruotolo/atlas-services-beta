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
            router.push('/perfil');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, router]);

    return (
        <div className="flex flex-col items-center justify-center bg-transparent py-12 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 size={64} />
            </div>

            <h2 className="mb-4 text-4xl font-black text-gray-900 dark:text-white">
                ¡Pago Exitoso!
            </h2>

            <div className="mb-8 flex items-center justify-center gap-2 text-xl font-medium text-blue-600 dark:text-blue-400">
                <PartyPopper size={24} />
                <span>Tu servicio ya es Premium y está destacado</span>
            </div>

            <p className="mb-12 max-w-md text-gray-600 dark:text-gray-400">
                Hemos recibido tu pago correctamente. Tu anuncio aparecerá en los primeros lugares
                de búsqueda de inmediato.
            </p>

            <div className="mb-8 rounded-2xl bg-gray-50 px-8 py-4 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Serás redirigido a tu perfil en{' '}
                    <span className="font-black text-blue-600 dark:text-blue-400">
                        {countdown} segundos
                    </span>
                </p>
            </div>

            <button
                type="button"
                onClick={() => router.push('/perfil')}
                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 dark:shadow-none"
            >
                Ir a mi Perfil ahora
                <ArrowRight size={20} />
            </button>
        </div>
    );
}
