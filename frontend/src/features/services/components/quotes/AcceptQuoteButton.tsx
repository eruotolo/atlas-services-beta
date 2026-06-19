'use client';

import { useState, type ReactElement } from 'react';

import { acceptQuote } from '@/features/services/actions/quotes';

interface AcceptQuoteButtonProps {
    quoteId: string;
    countryCode: string;
}

export function AcceptQuoteButton({ quoteId, countryCode }: AcceptQuoteButtonProps): ReactElement {
    const [pending, setPending] = useState(false);

    async function handleAccept(): Promise<void> {
        setPending(true);
        await acceptQuote(quoteId, countryCode);
        setPending(false);
    }

    return (
        <button
            type="button"
            onClick={handleAccept}
            disabled={pending}
            className="self-start rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 bg-accent"
        >
            {pending ? 'Aceptando...' : 'Aceptar cotización'}
        </button>
    );
}
