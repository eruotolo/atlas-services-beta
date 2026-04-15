'use client';

import { useOptimistic, useTransition } from 'react';

import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
    serviceId: string;
    initialIsFavorite: boolean;
    onToggle: (serviceId: string, newState: boolean) => Promise<{ success?: boolean; error?: string }>;
    size?: 'sm' | 'md';
}

export default function FavoriteButton({
    serviceId,
    initialIsFavorite,
    onToggle,
    size = 'md',
}: FavoriteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(initialIsFavorite);

    const handleClick = () => {
        const newState = !optimisticFavorite;
        startTransition(async () => {
            setOptimisticFavorite(newState);
            const result = await onToggle(serviceId, newState);
            if (result.error) {
                // Revert on error
                setOptimisticFavorite(!newState);
            }
        });
    };

    const isSmall = size === 'sm';

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className={`group rounded-full border transition-all duration-300 ${
                optimisticFavorite
                    ? 'border-red-200 bg-red-50 text-red-500 shadow-sm shadow-red-100 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400 dark:shadow-none'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-500 dark:hover:border-red-500/30 dark:hover:bg-red-500/15 dark:hover:text-red-400'
            } ${isSmall ? 'p-1.5' : 'p-2.5 md:p-3'} ${isPending ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
            title={optimisticFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
            <Heart
                size={isSmall ? 14 : 16}
                className={`transition-transform duration-300 ${optimisticFavorite ? 'scale-110' : 'group-hover:scale-110'} ${isSmall ? '' : 'md:h-[18px] md:w-[18px]'}`}
                fill={optimisticFavorite ? 'currentColor' : 'none'}
            />
        </button>
    );
}
