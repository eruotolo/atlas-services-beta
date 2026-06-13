'use client';

import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Btn, Mono } from '@/shared/components/hireeo';

interface SearchPaginationProps {
    dict: Dictionary;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
}

const ELLIPSIS = '…' as const;

function buildPageList(currentPage: number, totalPages: number): Array<number | typeof ELLIPSIS> {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: Array<number | typeof ELLIPSIS> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push(ELLIPSIS);
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < totalPages - 1) pages.push(ELLIPSIS);
    pages.push(totalPages);
    return pages;
}

export function SearchPagination({
    dict,
    currentPage,
    totalPages,
    totalCount,
    pageSize = 12,
    onPageChange,
}: SearchPaginationProps): ReactElement {
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalCount);
    const pages = buildPageList(currentPage, totalPages);

    return (
        <div
            className="mt-7 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center text-sub"
        >
            <div className="text-[12.5px]">
                {dict.search.paginationShowing}{' '}
                <Mono className="font-semibold text-ink">
                    {from}–{to}
                </Mono>{' '}
                {dict.search.paginationOf}{' '}
                <Mono className="font-semibold text-ink">
                    {totalCount}
                </Mono>
            </div>

            <nav className="flex items-center gap-1">
                <Btn
                    variant="secondary"
                    size="sm"
                    icon="arrowLeft"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    aria-label={dict.search.paginationPrev}
                >
                    <span className="hidden md:inline">{dict.search.paginationPrev}</span>
                </Btn>

                {pages.map((p, i) => {
                    if (p === ELLIPSIS) {
                        const prevPage = typeof pages[i - 1] === 'number' ? pages[i - 1] : 0;
                        return (
                            <span
                                key={`ellipsis-after-${prevPage}`}
                                className="px-1 text-[12.5px] text-muted"
                            >
                                {ELLIPSIS}
                            </span>
                        );
                    }
                    const active = p === currentPage;
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className="h-8 w-8 cursor-pointer rounded-md text-[12.5px] font-medium transition-colors"
                            style={{
                                background: active ? 'var(--ink)' : 'transparent',
                                color: active ? 'var(--bg)' : 'var(--sub)',
                            }}
                        >
                            {p}
                        </button>
                    );
                })}

                <Btn
                    variant="secondary"
                    size="sm"
                    iconRight="arrow"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    aria-label={dict.search.paginationNext}
                >
                    <span className="hidden md:inline">{dict.search.paginationNext}</span>
                </Btn>
            </nav>
        </div>
    );
}
