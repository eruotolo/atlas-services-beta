'use client';

import { useState } from 'react';

import { MessageSquare, Phone } from 'lucide-react';

import { registrarInteraccion } from '@/features/analytics/actions';

import { getCleanPhone } from '@/shared/lib/utils';

interface ContactButtonsProps {
    servicioId: string;
    userPhone: string | null;
}

export default function ContactButtons({ servicioId, userPhone }: ContactButtonsProps) {
    const [showPhone, setShowPhone] = useState(false);

    const handleShowPhone = () => {
        if (!userPhone) return;

        setShowPhone(true);
        registrarInteraccion(servicioId, 'LLAMAR');
        const cleanPhone = getCleanPhone(userPhone);

        // Abrir aplicación de llamada
        window.location.href = `tel:${cleanPhone}`;
    };

    const handleSendMessage = () => {
        if (!userPhone) return;

        registrarInteraccion(servicioId, 'WHATSAPP');
        const cleanPhone = getCleanPhone(userPhone);
        // Si no tiene el código de país +56 (Chile), agregarlo
        const finalPhone = cleanPhone.startsWith('+') ? cleanPhone : `+56${cleanPhone}`;
        const message = encodeURIComponent('Hola! me gustaría contratar tu servicio.');

        // Abrir WhatsApp con mensaje predeterminado
        window.open(`https://wa.me/${finalPhone.replace('+', '')}?text=${message}`, '_blank');
    };

    return (
        <div className="mb-8 space-y-4">
            <button
                type="button"
                onClick={handleShowPhone}
                className="btn-primary flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl py-4 text-lg"
            >
                <Phone size={20} />
                {showPhone && userPhone ? userPhone : 'Ver Teléfono'}
            </button>
            <button
                type="button"
                onClick={handleSendMessage}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 py-4 text-lg font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-gray-800"
            >
                <MessageSquare size={20} />
                Enviar Mensaje
            </button>
        </div>
    );
}
