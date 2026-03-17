'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink, Megaphone } from 'lucide-react';

interface Sponsor {
    id: string;
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion?: string | null;
}

interface SponsorStandardProps {
    sponsor: Sponsor | null;
}

export default function SponsorStandard({ sponsor }: SponsorStandardProps) {
    if (!sponsor) {
        // Placeholder si no hay sponsor
        return (
            <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    Publicidad
                </p>
                <div className="group flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-blue-100 bg-blue-50/40 px-4 py-8 text-center transition-colors hover:bg-blue-50">
                    <Megaphone
                        size={20}
                        className="mb-2 text-blue-400 transition-transform group-hover:scale-110"
                    />
                    <Link href="/contacto" className="text-center">
                        <h4 className="mb-1 text-[10px] font-black tracking-[0.2em] text-blue-800 uppercase">
                            Espacio Publicitario Disponible
                        </h4>
                        <p className="text-xs font-medium text-blue-400">
                            Destaca tu negocio aquí y llega a toda la isla
                        </p>
                        <p className="mt-4 text-[9px] font-black tracking-widest text-blue-600 uppercase underline">
                            Saber más
                        </p>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                Sugerido
            </p>
            <Link
                href={sponsor.linkExterno}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
                <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                        src={sponsor.imagenUrl}
                        alt={sponsor.nombre}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute right-3 bottom-3 translate-y-2 rounded-full bg-white/90 p-1.5 text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <ExternalLink size={14} />
                    </div>
                </div>
                <div className="p-3">
                    <h3 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                        {sponsor.nombre}
                    </h3>
                    {sponsor.descripcion && (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-gray-500">
                            {sponsor.descripcion}
                        </p>
                    )}
                </div>
            </Link>
        </div>
    );
}
