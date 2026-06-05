'use client';

import { useEffect } from 'react';

import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
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

    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <button
                type="button"
                className="absolute inset-0 cursor-pointer border-none bg-black/50 p-0 outline-none"
                onClick={onClose}
                onKeyDown={handleKeyDown}
                aria-label="Cerrar modal"
            />

            {/* Modal */}
            <div className="relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-bg shadow-xl">
                <div className="flex items-center justify-between p-8 pb-4">
                    <h2 className="text-2xl font-black text-ink">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl p-2 text-muted transition-colors hover:bg-tint hover:text-ink"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="scrollbar-custom mr-2 max-h-[70vh] overflow-y-auto px-8 pr-4 pb-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
