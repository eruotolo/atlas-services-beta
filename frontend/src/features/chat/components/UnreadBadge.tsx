'use client';

import { MessageSquare } from 'lucide-react';

interface UnreadBadgeProps {
    count: number;
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
    if (count <= 0) {
        return (
            <MessageSquare
                size={18}
                className="text-gray-500 transition-colors hover:text-brand dark:text-gray-400 dark:hover:text-brand-light"
            />
        );
    }

    return (
        <span className="relative inline-flex">
            <MessageSquare
                size={18}
                className="text-gray-500 transition-colors hover:text-brand dark:text-gray-400 dark:hover:text-brand-light"
            />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {count > 99 ? '99+' : count}
            </span>
        </span>
    );
}
