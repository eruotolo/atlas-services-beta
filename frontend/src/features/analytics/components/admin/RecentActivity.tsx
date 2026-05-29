'use client';

import { Mail, MessageSquare, Phone } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RecentInteraction {
    id: string;
    tipo: string;
    createdAt: Date;
    servicio: {
        titulo: string;
        usuario: { nombre: string };
    };
    usuario: { nombre: string; email: string } | null;
}

interface RecentActivityProps {
    interactions: RecentInteraction[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getIcon(tipo: string) {
    switch (tipo) {
        case 'VER_TELEFONO':
        case 'VIEW_PHONE':
            return <Phone size={16} className="text-brand" />;
        case 'VER_EMAIL':
        case 'VIEW_EMAIL':
            return <Mail size={16} className="text-purple-500" />;
        case 'LLAMAR':
        case 'CALL':
            return <Phone size={16} className="fill-current text-green-500" />;
        case 'WHATSAPP':
            return <MessageSquare size={16} className="text-green-600" />;
        default:
            return <Phone size={16} className="text-muted" />;
    }
}

function getLabel(tipo: string) {
    switch (tipo) {
        case 'VER_TELEFONO':
        case 'VIEW_PHONE':
            return 'vio el teléfono';
        case 'VER_EMAIL':
        case 'VIEW_EMAIL':
            return 'vio el email';
        case 'LLAMAR':
        case 'CALL':
            return 'hizo click en llamar';
        case 'WHATSAPP':
            return 'contactó por WhatsApp';
        default:
            return tipo.toLowerCase();
    }
}

function getBg(tipo: string) {
    switch (tipo) {
        case 'VER_TELEFONO':
        case 'VIEW_PHONE':
            return 'bg-brand/5';
        case 'VER_EMAIL':
        case 'VIEW_EMAIL':
            return 'bg-purple-50';
        case 'LLAMAR':
        case 'CALL':
            return 'bg-green-50';
        case 'WHATSAPP':
            return 'bg-emerald-50';
        default:
            return 'bg-tint';
    }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RecentActivity({ interactions }: RecentActivityProps) {
    return (
        <div className="rounded-[2rem] border border-line bg-bg p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-ink">
                    Actividad Reciente
                </h2>
                <span className="rounded-full bg-tint px-3 py-1 text-xs font-bold text-muted">
                    Últimas {interactions.length} interacciones
                </span>
            </div>

            <div className="space-y-4">
                {interactions.length > 0 ? (
                    interactions.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-4 border-b border-line pb-4 last:border-0 last:pb-0"
                        >
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getBg(item.tipo)}`}
                            >
                                {getIcon(item.tipo)}
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-ink">
                                    {item.usuario?.nombre ?? 'Un visitante'}{' '}
                                    <span className="font-medium text-muted">
                                        {getLabel(item.tipo)}
                                    </span>
                                </p>
                                <p className="text-xs text-muted">
                                    en &ldquo;{item.servicio.titulo}&rdquo;
                                </p>
                            </div>
                            <span className="text-[10px] font-medium whitespace-nowrap text-muted">
                                {new Intl.DateTimeFormat('es-CL', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }).format(new Date(item.createdAt))}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="py-8 text-center text-sm text-muted italic">
                        No hay actividad reciente registrada.
                    </p>
                )}
            </div>
        </div>
    );
}
