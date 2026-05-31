'use client';

import { useId, useState, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react';

import { Icon } from '@/shared/components/hireeo';

interface CheckboxInkProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'children'> {
    label: ReactNode;
    size?: 'sm' | 'md';
}

const SIZES = {
    sm: { box: 14, icon: 9 },
    md: { box: 16, icon: 10 },
} as const;

export function CheckboxInk({
    label,
    size = 'sm',
    checked,
    defaultChecked,
    onChange,
    className,
    ...rest
}: CheckboxInkProps): ReactElement {
    const reactId = useId();
    const inputId = rest.id ?? reactId;
    const isControlled = checked !== undefined;
    const [internal, setInternal] = useState<boolean>(defaultChecked ?? false);
    const value = isControlled ? Boolean(checked) : internal;
    const { box, icon } = SIZES[size];

    return (
        <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-start gap-2.5 select-none text-[12.5px] ${className ?? ''}`}
            style={{ color: 'var(--sub)', lineHeight: 1.5 }}
        >
            <input
                {...rest}
                id={inputId}
                type="checkbox"
                checked={isControlled ? value : undefined}
                defaultChecked={!isControlled ? defaultChecked : undefined}
                onChange={(e) => {
                    if (!isControlled) setInternal(e.target.checked);
                    onChange?.(e);
                }}
                className="sr-only peer"
            />
            <span
                aria-hidden
                className="mt-0.5 inline-flex shrink-0 items-center justify-center rounded peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1"
                style={{
                    width: box,
                    height: box,
                    background: value ? 'var(--ink)' : 'transparent',
                    border: '1.5px solid var(--ink)',
                }}
            >
                {value ? <Icon name="check" size={icon} stroke="var(--bg)" /> : null}
            </span>
            <span>{label}</span>
        </label>
    );
}
