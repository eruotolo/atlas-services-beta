'use client';

import { useState, type ReactElement } from 'react';

type ToggleSize = 'sm' | 'md';

interface ToggleProps {
    checked?: boolean;
    defaultChecked?: boolean;
    size?: ToggleSize;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
    ariaLabel?: string;
}

const sizes: Record<ToggleSize, { track: string; thumb: string; offset: string }> = {
    sm: { track: 'w-7 h-4', thumb: 'w-3 h-3', offset: 'translate-x-3' },
    md: { track: 'w-[34px] h-5', thumb: 'w-4 h-4', offset: 'translate-x-[14px]' },
};

export function Toggle({
    checked,
    defaultChecked = false,
    size = 'md',
    onChange,
    disabled = false,
    ariaLabel,
}: ToggleProps): ReactElement {
    const [internal, setInternal] = useState<boolean>(defaultChecked);
    const isControlled = typeof checked === 'boolean';
    const value = isControlled ? checked : internal;

    function handleClick(): void {
        if (disabled) return;
        const next = !value;
        if (!isControlled) setInternal(next);
        onChange?.(next);
    }

    const s = sizes[size];
    return (
        <button
            type="button"
            role="switch"
            aria-checked={value}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={handleClick}
            className={`${s.track} relative inline-flex shrink-0 items-center rounded-full border border-line p-[2px] transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
            style={{ background: value ? 'var(--ink)' : 'var(--tint)' }}
        >
            <span
                className={`${s.thumb} ${value ? s.offset : 'translate-x-0'} inline-block rounded-full bg-white shadow-sm transition-transform`}
            />
        </button>
    );
}
