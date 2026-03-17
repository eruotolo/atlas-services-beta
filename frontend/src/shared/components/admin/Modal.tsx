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
            <div className="relative z-10 mx-4 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl dark:border dark:border-white/10 dark:bg-gray-900">
                <div className="flex items-center justify-between p-8 pb-4">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="scrollbar-custom mr-2 max-h-[85vh] overflow-y-auto px-8 pr-4 pb-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
