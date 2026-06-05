'use client';

import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Btn, Icon } from '@/shared/components/hireeo';

interface EmptyResultsProps {
    dict: Dictionary;
    onReset: () => void;
}

export function EmptyResults({ dict, onReset }: EmptyResultsProps): ReactElement {
    return (
        <div
            className="rounded-xl border bg-bg p-16 text-center"
            style={{ borderColor: 'var(--line)' }}
        >
            <div
                className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: 'var(--tint)' }}
            >
                <Icon name="search" size={28} stroke="var(--muted)" />
            </div>
            <h3
                className="m-0 mb-2 text-[20px] font-semibold"
                style={{ color: 'var(--ink)', letterSpacing: '-0.015em' }}
            >
                {dict.search.noResults}
            </h3>
            <p
                className="mx-auto mb-6 max-w-[480px] text-[14px]"
                style={{ color: 'var(--sub)' }}
            >
                {dict.search.noResultsHint}
            </p>
            <Btn variant="primary" onClick={onReset} icon="refresh">
                {dict.search.clearAllFilters}
            </Btn>
        </div>
    );
}
