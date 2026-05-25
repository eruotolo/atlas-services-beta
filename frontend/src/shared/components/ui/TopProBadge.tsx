'use client';

import { Award } from 'lucide-react';

interface TopProBadgeProps {
    isTopPro: boolean;
    size?: 'sm' | 'md';
}

export default function TopProBadge({ isTopPro, size = 'md' }: TopProBadgeProps) {
    if (!isTopPro) return null;

    const isSmall = size === 'sm';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wider uppercase ${
                isSmall
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-0.5 text-[8px] text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400'
                    : 'bg-gradient-to-r from-amber-50 to-yellow-50 px-2.5 py-1 text-[9px] text-amber-700 shadow-sm shadow-amber-100 md:text-[10px] dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400 dark:shadow-none'
            }`}
            title="Profesional con alta calificación y múltiples reseñas positivas"
        >
            <Award
                size={isSmall ? 10 : 12}
                className="text-amber-500 dark:text-amber-400"
                fill="currentColor"
            />
            Top Pro
        </span>
    );
}
