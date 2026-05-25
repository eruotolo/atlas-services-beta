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
            return <Phone size={16} className="text-gray-400" />;
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
            return 'bg-brand/5 dark:bg-brand/10';
        case 'VER_EMAIL':
        case 'VIEW_EMAIL':
            return 'bg-purple-50 dark:bg-purple-500/10';
        case 'LLAMAR':
        case 'CALL':
            return 'bg-green-50 dark:bg-green-500/10';
        case 'WHATSAPP':
            return 'bg-emerald-50 dark:bg-emerald-500/10';
        default:
            return 'bg-gray-50 dark:bg-gray-800';
    }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RecentActivity({ interactions }: RecentActivityProps) {
    return (
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    Actividad Reciente
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Últimas {interactions.length} interacciones
                </span>
            </div>

            <div className="space-y-4">
                {interactions.length > 0 ? (
                    interactions.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0 dark:border-white/5"
                        >
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getBg(item.tipo)}`}
                            >
                                {getIcon(item.tipo)}
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {item.usuario?.nombre ?? 'Un visitante'}{' '}
                                    <span className="font-medium text-gray-500 dark:text-gray-400">
                                        {getLabel(item.tipo)}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    en &ldquo;{item.servicio.titulo}&rdquo;
                                </p>
                            </div>
                            <span className="text-[10px] font-medium whitespace-nowrap text-gray-400 dark:text-gray-600">
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
                    <p className="py-8 text-center text-sm text-gray-500 italic dark:text-gray-600">
                        No hay actividad reciente registrada.
                    </p>
                )}
            </div>
        </div>
    );
}
