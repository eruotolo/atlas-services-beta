'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { X } from '@/shared/components/icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay */}
            <button
                type="button"
                className="absolute inset-0 cursor-pointer border-none bg-black/40 p-0 outline-none backdrop-blur-sm transition-opacity"
                onClick={onClose}
                onKeyDown={handleKeyDown}
                aria-label="Cerrar modal"
            />

            {/* Modal */}
            <div className="relative z-10 mx-4 w-full max-w-4xl animate-in zoom-in-95 fade-in overflow-hidden rounded-2xl border border-white/20 bg-bg/95 shadow-2xl backdrop-blur-xl duration-200 dark:border-white/10 dark:bg-tint/90">
                <div className="flex h-14 items-center justify-between border-b border-line/50 px-6">
                    <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-line/50 hover:text-ink"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="scrollbar-custom mr-1 max-h-[80vh] overflow-y-auto px-6 py-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
