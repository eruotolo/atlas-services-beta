'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, Link as LinkIcon, MessageCircle, Share2 } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text: string;
    url: string; // URL absoluta idealmente, o relativa que convertiremos
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Asegurar URL absoluta
    const fullUrl = url.startsWith('http')
        ? url
        : typeof window !== 'undefined'
          ? `${window.location.origin}${url}`
          : url;

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShare = async () => {
        // Intento 1: Web Share API (Nativo Móvil)
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: fullUrl,
                });
                return; // Si funcionó, no hacemos nada más
            } catch (_error) {
                // Si el usuario canceló, no pasa nada.
                // Si falló por soporte, seguimos al fallback.
            }
        }

        // Fallback: Mostrar menú desktop
        setIsOpen(!isOpen);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsOpen(false);
    };

    const shareWhatsApp = () => {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${fullUrl}`)}`;
        window.open(waUrl, '_blank');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={handleShare}
                className="flex cursor-pointer items-center justify-center rounded-full border border-gray-100 p-2.5 text-gray-400 shadow-sm transition-colors hover:bg-brand/5 hover:text-brand md:p-3 dark:border-brand/20 dark:bg-brand/5 dark:text-brand-light dark:hover:bg-brand/50/20 dark:hover:text-brand-light"
                title="Compartir"
            >
                <Share2 size={16} className="md:h-[18px] md:w-[18px]" />
            </button>

            {/* Menú Desktop (Fallback) */}
            {isOpen && (
                <div className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-brand-marino/10">
                    <div className="flex flex-col py-1">
                        <button
                            type="button"
                            onClick={shareWhatsApp}
                            className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <MessageCircle size={16} className="text-green-500" />
                            WhatsApp
                        </button>
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="flex items-center gap-3 border-t border-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            {copied ? (
                                <Check size={16} className="text-brand" />
                            ) : (
                                <LinkIcon size={16} className="text-gray-400" />
                            )}
                            {copied ? '¡Copiado!' : 'Copiar enlace'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
