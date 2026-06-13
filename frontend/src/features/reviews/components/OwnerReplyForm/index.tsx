'use client';

import { useState, useTransition } from 'react';

import { MessageCircleReply, Send } from '@/shared/components/icons';

import { responderReview } from '@/features/reviews/actions/mutations';

interface OwnerReplyFormProps {
    serviceId: string;
    ratingId: string;
}

export default function OwnerReplyForm({ serviceId, ratingId }: OwnerReplyFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [response, setResponse] = useState('');
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

    if (result?.success) {
        return (
            <div className="mt-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                ✓ Tu respuesta ha sido publicada.
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand transition-colors hover:text-brand-hover"
            >
                <MessageCircleReply size={14} />
                Responder a esta reseña
            </button>
        );
    }

    const handleSubmit = () => {
        if (!response.trim() || response.length < 5) return;
        startTransition(async () => {
            const res = await responderReview(serviceId, ratingId, response);
            setResult(res);
        });
    };

    return (
        <div className="mt-3 space-y-2">
            <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Escribe tu respuesta..."
                maxLength={1000}
                rows={3}
                className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-sub placeholder-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
            />
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted">
                    {response.length}/1000
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-tint"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending || response.trim().length < 5}
                        className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send size={12} />
                        {isPending ? 'Enviando...' : 'Publicar'}
                    </button>
                </div>
            </div>
            {result?.error && (
                <p className="text-xs text-red-500">{result.error}</p>
            )}
        </div>
    );
}
