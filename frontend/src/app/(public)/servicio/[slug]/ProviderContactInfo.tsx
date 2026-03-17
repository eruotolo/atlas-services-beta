'use client';

import { useState } from 'react';

import Image from 'next/image';

import {
    Eye,
    Facebook,
    Globe,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    Twitter,
    Youtube,
} from 'lucide-react';

import { registrarInteraccion } from '@/features/analytics/actions';

interface RedSocial {
    tipo: string;
    url: string;
}

interface ProviderContactInfoProps {
    servicioId: string;
    userName: string;
    userAvatar: string | null;
    userPhone: string | null;
    userEmail: string | null;
    redesSociales?: RedSocial[];
}

export default function ProviderContactInfo({
    servicioId,
    userName,
    userAvatar,
    userPhone,
    userEmail,
    redesSociales,
}: ProviderContactInfoProps) {
    const [showPhone, setShowPhone] = useState(false);
    const [showEmail, setShowEmail] = useState(false);

    const handleShowPhone = () => {
        if (!showPhone) {
            setShowPhone(true);
            registrarInteraccion(servicioId, 'VER_TELEFONO');
        }
    };

    const handleShowEmail = () => {
        if (!showEmail) {
            setShowEmail(true);
            registrarInteraccion(servicioId, 'VER_EMAIL');
        }
    };

    // Función para enmascarar teléfono
    const maskPhone = (phone: string) => {
        // Asumiendo formato +56 9 1234 5678 o similar
        // Mostrar +56 9 **** ****
        if (phone.length < 8) return '****';
        return `${phone.substring(0, 6)} **** ****`;
    };

    // Función para enmascarar email
    const maskEmail = (email: string) => {
        const [name, domain] = email.split('@');
        if (!name || !domain) return '****@****.com';
        return `${name.substring(0, 2)}****@${domain}`;
    };

    const getSocialIcon = (tipo: string) => {
        switch (tipo) {
            case 'FACEBOOK':
                return <Facebook size={18} />;
            case 'INSTAGRAM':
                return <Instagram size={18} />;
            case 'LINKEDIN':
                return <Linkedin size={18} />;
            case 'TWITTER':
                return <Twitter size={18} />;
            case 'YOUTUBE':
                return <Youtube size={18} />;
            default:
                return <Globe size={18} />;
        }
    };

    return (
        <div className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 md:rounded-2xl md:p-6 dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-xl">
            <h3 className="mb-4 text-base font-bold text-gray-900 md:text-lg dark:text-white">
                Sobre el Proveedor
            </h3>
            <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 md:h-16 md:w-16 dark:bg-blue-900/30">
                    {userAvatar ? (
                        <Image
                            src={userAvatar}
                            alt={userName}
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    ) : (
                        <span className="text-xl font-black text-blue-600 md:text-2xl dark:text-blue-400">
                            {userName.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 md:text-base dark:text-white">
                        {userName}
                    </p>
                    <p className="text-xs text-gray-500 md:text-sm dark:text-gray-400">
                        Proveedor verificado
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 dark:border-white/5">
                {userPhone && (
                    <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-600 md:text-sm dark:text-gray-300">
                        <div className="flex items-center gap-3">
                            <Phone size={14} className="text-blue-500 md:h-4 md:w-4" />
                            <span>{showPhone ? userPhone : maskPhone(userPhone)}</span>
                        </div>
                        {!showPhone && (
                            <button
                                type="button"
                                onClick={handleShowPhone}
                                className="cursor-pointer rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                title="Ver número completo"
                            >
                                <Eye size={16} />
                            </button>
                        )}
                    </div>
                )}
                {userEmail && (
                    <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-600 md:text-sm dark:text-gray-300">
                        <div className="flex items-center gap-3">
                            <Mail size={14} className="text-blue-500 md:h-4 md:w-4" />
                            <span>{showEmail ? userEmail : maskEmail(userEmail)}</span>
                        </div>
                        {!showEmail && (
                            <button
                                type="button"
                                onClick={handleShowEmail}
                                className="cursor-pointer rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                title="Ver email completo"
                            >
                                <Eye size={16} />
                            </button>
                        )}
                    </div>
                )}

                {redesSociales && redesSociales.length > 0 && (
                    <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-white/5">
                        {redesSociales.map((red) => (
                            <a
                                key={red.url}
                                href={red.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center rounded-full bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                title={red.tipo}
                            >
                                {getSocialIcon(red.tipo)}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
