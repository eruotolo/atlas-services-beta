import type React from 'react';

import { Eye, Mail, MessageSquare, Phone } from 'lucide-react';

export const getInteraccionIcon = (tipo: string): React.ReactNode => {
    switch (tipo) {
        case 'VER_TELEFONO':
            return <Phone size={16} className="text-brand" />;
        case 'VER_EMAIL':
            return <Mail size={16} className="text-purple-500" />;
        case 'LLAMAR':
            return <Phone size={16} className="fill-current text-green-500" />;
        case 'WHATSAPP':
            return <MessageSquare size={16} className="text-green-600" />;
        default:
            return <Eye size={16} className="text-muted" />;
    }
};

export const getInteraccionLabel = (tipo: string): string => {
    switch (tipo) {
        case 'VER_TELEFONO':
            return 'Vio Teléfono';
        case 'VER_EMAIL':
            return 'Vio Email';
        case 'LLAMAR':
            return 'Click Llamar';
        case 'WHATSAPP':
            return 'Click WhatsApp';
        default:
            return tipo;
    }
};
