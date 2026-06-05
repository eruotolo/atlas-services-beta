import type { ReactElement, ReactNode } from 'react';

interface FieldProps {
    label: string;
    hint?: string;
    error?: string;
    optional?: boolean;
    children: ReactNode;
}

export function Field({ label, hint, error, optional, children }: FieldProps): ReactElement {
    return (
        <div className="block">
            <div className="mb-1.5 flex items-center justify-between">
                <span
                    className="text-[12px] font-semibold tracking-[-0.005em]"
                    style={{ color: 'var(--ink)' }}
                >
                    {label}
                    {optional ? (
                        <span
                            className="ml-1.5 text-[10.5px] font-medium"
                            style={{ color: 'var(--muted)' }}
                        >
                            opcional
                        </span>
                    ) : null}
                </span>
                {hint && !error ? (
                    <span className="text-[11px]" style={{ color: 'var(--sub)' }}>
                        {hint}
                    </span>
                ) : null}
            </div>
            {children}
            {error ? (
                <div
                    className="mt-1.5 text-[11.5px] font-medium"
                    style={{ color: 'var(--danger)' }}
                >
                    {error}
                </div>
            ) : null}
        </div>
    );
}
