'use client';

import dynamic from 'next/dynamic';

import { Loader2 } from 'lucide-react';

const PaymentBrick = dynamic(() => import('./PaymentBrick'), {
    ssr: false,
    loading: () => (
        <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-4 animate-spin text-brand" />
                <p className="text-gray-600">Cargando formulario de pago seguro...</p>
            </div>
        </div>
    ),
});

interface PaymentBrickWrapperProps {
    servicioId: string;
    duracionMeses: number;
    precio: number;
    email?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PaymentBrickWrapper(props: PaymentBrickWrapperProps) {
    return <PaymentBrick {...props} />;
}
