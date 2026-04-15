'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
    exiting?: boolean;
}

interface ToastContextValue {
    toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastVariant, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

const ICON_COLORS: Record<ToastVariant, string> = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    info: 'text-brand dark:text-brand-light',
    warning: 'text-amber-500',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    }, []);

    const toast = useCallback(
        (message: string, variant: ToastVariant = 'success') => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            setToasts((prev) => [...prev, { id, message, variant }]);
            setTimeout(() => removeToast(id), 4000);
        },
        [removeToast],
    );

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => {
                    const Icon = ICONS[t.variant];
                    return (
                        <div
                            key={t.id}
                            className={`toast toast-${t.variant} ${t.exiting ? 'exiting' : ''}`}
                        >
                            <Icon size={18} className={ICON_COLORS[t.variant]} />
                            <span className="flex-1">{t.message}</span>
                            <button
                                type="button"
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
