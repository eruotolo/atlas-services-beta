'use client';

import { useTransition } from 'react';

import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { iniciarConversacion } from '@/features/chat/actions/mutations';
import { useCountryLink } from '@/features/geo/hooks/useCountryLink';

interface SendDirectMessageButtonProps {
    serviceId: string;
}

export default function SendDirectMessageButton({ serviceId }: SendDirectMessageButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const link = useCountryLink();

    const handleClick = () => {
        startTransition(async () => {
            const result = await iniciarConversacion(serviceId);
            if (result.conversationId) {
                router.push(link(`/perfil/mensajes/${result.conversationId}`));
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-brand/20 bg-brand/5 py-3 text-sm font-bold text-brand transition-all hover:border-brand/40 hover:bg-brand/10 disabled:cursor-wait disabled:opacity-60 md:text-base dark:border-brand-light/20 dark:bg-brand/10 dark:text-brand-light dark:hover:border-brand-light/40 dark:hover:bg-brand/20"
        >
            <MessageCircle size={18} />
            {isPending ? 'Abriendo chat...' : 'Mensaje Directo'}
        </button>
    );
}
