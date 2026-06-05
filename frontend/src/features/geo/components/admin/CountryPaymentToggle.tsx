'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCountryPayments } from '@/features/geo/actions/mutations';

interface Props {
    countryCode: string;
    initialStatus?: boolean;
}

export default function CountryPaymentToggle({ countryCode, initialStatus = true }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = () => {
        startTransition(async () => {
            const result = await updateCountryPayments(countryCode, !initialStatus);
            if (result.success) {
                router.refresh();
            } else {
                alert('Error al actualizar la configuración de pagos.');
            }
        });
    };

    return (
        <div className="flex items-center gap-3 bg-bg rounded-xl border border-line p-4 shadow-sm">
            <div className="flex-1">
                <p className="text-[14px] font-bold text-ink m-0">Pasarela de Pagos Activa</p>
                <p className="text-[13px] text-sub m-0 mt-0.5">
                    Habilita o deshabilita la suscripción y pagos obligatorios para {countryCode.toUpperCase()}. 
                    Útil para prelanzamientos gratuitos.
                </p>
            </div>
            <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    initialStatus ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className="sr-only">Toggle pagos</span>
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        initialStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
}
