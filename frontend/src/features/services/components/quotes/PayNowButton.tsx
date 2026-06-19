'use client';

import { useState, type ReactElement } from 'react';

import { Icon } from '@/shared/components/hireeo';

import { CheckoutModal } from './CheckoutModal';

interface PayNowButtonProps {
    quoteId: string;
    price: number;
    countryCode: string;
    /** Descripción del servicio para mostrar en el modal */
    serviceDescription?: string;
    /** Nombre del proveedor para mostrar en el modal */
    providerName?: string;
}

export function PayNowButton({
    quoteId,
    price,
    countryCode: _countryCode,
    serviceDescription,
    providerName,
}: PayNowButtonProps): ReactElement {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="self-start inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-all active:scale-95"
                style={{ background: 'var(--accent)' }}
            >
                <Icon name="card" size={14} stroke="currentColor" />
                Pagar ahora
            </button>

            <CheckoutModal
                open={open}
                onClose={() => setOpen(false)}
                quoteId={quoteId}
                price={price}
                serviceDescription={serviceDescription}
                providerName={providerName}
            />
        </>
    );
}
