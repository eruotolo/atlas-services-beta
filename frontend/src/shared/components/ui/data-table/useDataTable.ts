'use client';

import { useTransition } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useDataTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentPage = Number(searchParams.get('page')) || 1;
    const searchValue = searchParams.get('q') || '';

    function updateSearchParams(params: Record<string, string | number>) {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                newSearchParams.set(key, String(value));
            } else {
                newSearchParams.delete(key);
            }
        });

        startTransition(() => {
            router.push(`${pathname}?${newSearchParams.toString()}`);
        });
    }

    function handlePageChange(page: number) {
        updateSearchParams({ page, q: searchValue });
    }

    function handleSearchChange(value: string) {
        // Reset a página 1 cuando se busca
        updateSearchParams({ page: 1, q: value });
    }

    return {
        currentPage,
        searchValue,
        isPending,
        handlePageChange,
        handleSearchChange,
    };
}
