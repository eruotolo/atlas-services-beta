'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import { Icon } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';

const TABS: Array<{ label: string; icon: HireIconName; query: string }> = [
    { label: 'Hogar & Casa', icon: 'home', query: 'Hogar' },
    { label: 'Limpieza', icon: 'sparkle', query: 'Limpieza' },
    { label: 'Jardín & Exteriores', icon: 'leaf', query: 'Exteriores' },
    { label: 'Cuidado Infantil', icon: 'baby', query: 'Cuidado Infantil' },
    { label: 'Mascotas', icon: 'dog', query: 'Mascotas' },
    { label: 'Reparaciones', icon: 'hammer', query: 'Reparaciones' },
    { label: 'Eventos', icon: 'cam', query: 'Eventos' },
    { label: 'Plagas', icon: 'bug', query: 'Plagas' },
    { label: 'Belleza', icon: 'user', query: 'Belleza' },
    { label: 'Transporte', icon: 'truck', query: 'Fletes' },
    { label: 'Profesionales', icon: 'briefcase', query: 'Legal' },
];

const CARDS_BY_CATEGORY: Record<string, Array<{label: string, query: string, image: string}>> = {
    'Hogar': [
        { label: 'House Cleaning', query: 'Limpieza', image: 'https://loremflickr.com/600/800/cleaning?lock=1' },
        { label: 'Plomería', query: 'gasfiteria', image: 'https://loremflickr.com/600/800/plumbing?lock=2' },
        { label: 'Electricidad', query: 'electricidad', image: 'https://loremflickr.com/600/800/electrician?lock=3' },
        { label: 'Pintura', query: 'pintura', image: 'https://loremflickr.com/600/800/painting,wall?lock=4' },
        { label: 'Mudanzas', query: 'mudanzas', image: 'https://loremflickr.com/600/800/moving,boxes?lock=5' },
        { label: 'Carpintería', query: 'carpinteria', image: 'https://loremflickr.com/600/800/carpentry?lock=6' },
    ],
    'Limpieza': [
        { label: 'Limpieza General', query: 'Limpieza', image: 'https://loremflickr.com/600/800/cleaning,house?lock=7' },
        { label: 'Limpieza Profunda', query: 'Limpieza', image: 'https://loremflickr.com/600/800/scrubbing?lock=8' },
        { label: 'Lavado de Alfombras', query: 'Limpieza', image: 'https://loremflickr.com/600/800/carpet,cleaning?lock=9' },
        { label: 'Limpieza de Ventanas', query: 'Limpieza', image: 'https://loremflickr.com/600/800/window,cleaning?lock=10' },
        { label: 'Limpieza Fin de Obra', query: 'Limpieza', image: 'https://loremflickr.com/600/800/construction,cleaning?lock=11' },
        { label: 'Limpieza de Tapices', query: 'Limpieza', image: 'https://loremflickr.com/600/800/upholstery?lock=12' },
    ],
    'Exteriores': [
        { label: 'Landscaping', query: 'Paisajismo', image: 'https://loremflickr.com/600/800/landscaping?lock=13' },
        { label: 'Corte de Césped', query: 'corte-cesped', image: 'https://loremflickr.com/600/800/lawnmower?lock=14' },
        { label: 'Poda de Árboles', query: 'Paisajismo', image: 'https://loremflickr.com/600/800/tree,pruning?lock=15' },
        { label: 'Riego', query: 'Paisajismo', image: 'https://loremflickr.com/600/800/irrigation?lock=16' },
        { label: 'Mantenimiento de Patios', query: 'Paisajismo', image: 'https://loremflickr.com/600/800/patio?lock=17' },
        { label: 'Limpieza de Piscinas', query: 'Piscinas', image: 'https://loremflickr.com/600/800/swimmingpool?lock=18' },
    ],
    'Cuidado Infantil': [
        { label: 'Babysitters', query: 'nineras', image: 'https://loremflickr.com/600/800/babysitter?lock=19' },
        { label: 'Tutorías Escolares', query: 'nineras', image: 'https://loremflickr.com/600/800/tutoring?lock=20' },
        { label: 'Cuidado Nocturno', query: 'nineras', image: 'https://loremflickr.com/600/800/sleeping,baby?lock=21' },
        { label: 'Cuidado de Adultos', query: 'cuidado-adultos', image: 'https://loremflickr.com/600/800/elderly,care?lock=22' },
        { label: 'Acompañante Terapéutico', query: 'cuidado-adultos', image: 'https://loremflickr.com/600/800/therapy?lock=23' },
        { label: 'Enfermería a Domicilio', query: 'cuidado-adultos', image: 'https://loremflickr.com/600/800/nurse?lock=24' },
    ],
    'Mascotas': [
        { label: 'Pet Sitting', query: 'mascotas', image: 'https://loremflickr.com/600/800/petsitting?lock=25' },
        { label: 'Paseadores de Perros', query: 'mascotas', image: 'https://loremflickr.com/600/800/dogwalker?lock=26' },
        { label: 'Peluquería Canina', query: 'mascotas', image: 'https://loremflickr.com/600/800/doggrooming?lock=27' },
        { label: 'Adiestramiento', query: 'mascotas', image: 'https://loremflickr.com/600/800/dogtraining?lock=28' },
        { label: 'Visitas a Domicilio', query: 'mascotas', image: 'https://loremflickr.com/600/800/veterinarian?lock=29' },
        { label: 'Cuidado de Gatos', query: 'mascotas', image: 'https://loremflickr.com/600/800/cat?lock=30' },
    ],
    'Reparaciones': [
        { label: 'Reparaciones Generales', query: 'Reparaciones', image: 'https://loremflickr.com/600/800/handyman?lock=31' },
        { label: 'Línea Blanca', query: 'linea-blanca', image: 'https://loremflickr.com/600/800/appliancerepair?lock=32' },
        { label: 'Climatización', query: 'climatizacion', image: 'https://loremflickr.com/600/800/hvac?lock=33' },
        { label: 'Techos', query: 'techos', image: 'https://loremflickr.com/600/800/roofing?lock=34' },
        { label: 'Cerrajero', query: 'cerrajeria', image: 'https://loremflickr.com/600/800/locksmith?lock=35' },
        { label: 'Electrónica', query: 'Reparaciones', image: 'https://loremflickr.com/600/800/electronicsrepair?lock=36' },
    ],
    'Eventos': [
        { label: 'Fotografía', query: 'Eventos', image: 'https://loremflickr.com/600/800/photography?lock=37' },
        { label: 'Catering', query: 'Eventos', image: 'https://loremflickr.com/600/800/catering?lock=38' },
        { label: 'DJs', query: 'Eventos', image: 'https://loremflickr.com/600/800/dj?lock=39' },
        { label: 'Animadores', query: 'Eventos', image: 'https://loremflickr.com/600/800/party,entertainment?lock=40' },
        { label: 'Garzones', query: 'Eventos', image: 'https://loremflickr.com/600/800/waiter?lock=41' },
        { label: 'Decoración', query: 'Eventos', image: 'https://loremflickr.com/600/800/event,decoration?lock=42' },
    ],
    'Plagas': [
        { label: 'Fumigación', query: 'Plagas', image: 'https://loremflickr.com/600/800/pestcontrol?lock=43' },
        { label: 'Desratización', query: 'Plagas', image: 'https://loremflickr.com/600/800/rat?lock=44' },
        { label: 'Insectos', query: 'Plagas', image: 'https://loremflickr.com/600/800/insect?lock=45' },
        { label: 'Aves', query: 'Plagas', image: 'https://loremflickr.com/600/800/bird?lock=46' },
        { label: 'Termitas', query: 'Plagas', image: 'https://loremflickr.com/600/800/termite?lock=47' },
        { label: 'Manejo Preventivo', query: 'Plagas', image: 'https://loremflickr.com/600/800/exterminator?lock=48' },
    ],
    'Belleza': [
        { label: 'Peluquería', query: 'Belleza', image: 'https://loremflickr.com/600/800/hairsalon?lock=49' },
        { label: 'Maquillaje', query: 'Belleza', image: 'https://loremflickr.com/600/800/makeup?lock=50' },
        { label: 'Manicure', query: 'Belleza', image: 'https://loremflickr.com/600/800/manicure?lock=51' },
        { label: 'Masajes', query: 'Belleza', image: 'https://loremflickr.com/600/800/massage?lock=52' },
        { label: 'Cuidado Facial', query: 'Belleza', image: 'https://loremflickr.com/600/800/facial?lock=53' },
        { label: 'Depilación', query: 'Belleza', image: 'https://loremflickr.com/600/800/waxing?lock=54' },
    ],
    'Fletes': [
        { label: 'Fletes y Mudanzas', query: 'Fletes', image: 'https://loremflickr.com/600/800/moving,truck?lock=55' },
        { label: 'Transporte de Carga', query: 'Fletes', image: 'https://loremflickr.com/600/800/freight?lock=56' },
        { label: 'Despacho Rápido', query: 'Fletes', image: 'https://loremflickr.com/600/800/delivery?lock=57' },
        { label: 'Encomiendas', query: 'Fletes', image: 'https://loremflickr.com/600/800/parcel?lock=58' },
        { label: 'Logística', query: 'Fletes', image: 'https://loremflickr.com/600/800/logistics?lock=59' },
        { label: 'Vehículos Especiales', query: 'Fletes', image: 'https://loremflickr.com/600/800/towtruck?lock=60' },
    ],
    'Legal': [
        { label: 'Asesoría Legal', query: 'Legal', image: 'https://loremflickr.com/600/800/lawyer?lock=61' },
        { label: 'Contadores', query: 'Legal', image: 'https://loremflickr.com/600/800/accountant?lock=62' },
        { label: 'Notaría', query: 'Legal', image: 'https://loremflickr.com/600/800/notary?lock=63' },
        { label: 'Consultoría', query: 'Legal', image: 'https://loremflickr.com/600/800/consulting?lock=64' },
        { label: 'Traducciones', query: 'Legal', image: 'https://loremflickr.com/600/800/translation?lock=65' },
        { label: 'Trámites', query: 'Legal', image: 'https://loremflickr.com/600/800/paperwork?lock=66' },
    ],
};

export function HomeCategories(): ReactElement {
    const link = useCountryLink();
    const [activeTab, setActiveTab] = useState<string>('Hogar');

    const currentCards = CARDS_BY_CATEGORY[activeTab] || CARDS_BY_CATEGORY['Hogar'];

    return (
        <div className="w-full mt-14">
            {/* Top Navigation Row (Thumbtack style) */}
            <div 
                className="mb-8 flex items-center justify-between overflow-x-auto border-b pb-6"
                style={{ borderColor: 'var(--line)', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.query;
                    return (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.query)}
                            className="group flex flex-col items-center gap-2.5 min-w-max transition-colors"
                            style={{ color: isActive ? 'var(--accent)' : 'var(--sub)' }}
                        >
                            <div 
                                className="flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform group-hover:scale-105"
                                style={{ 
                                    background: isActive ? 'var(--accent)' : 'var(--tint)', 
                                    border: isActive ? 'none' : '1px solid var(--line)',
                                }}
                            >
                                <Icon name={tab.icon} size={22} color={isActive ? 'white' : 'var(--sub)'} />
                            </div>
                            <span
                                className="text-[13px] transition-colors"
                                style={{ color: isActive ? 'var(--ink)' : 'var(--sub)', fontWeight: isActive ? 700 : 500 }}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Grid of Visual Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 relative min-h-[250px] mt-10">
                {currentCards.map((card, idx) => (
                    <Link
                        key={card.label + idx}
                        href={link(`/buscar?c=${encodeURIComponent(card.query)}`)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-[14px] bg-tint transition-all hover:shadow-lg hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationFillMode: 'both', animationDelay: `${idx * 50}ms` }}
                    >
                        {/* Background Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={card.image}
                            alt={card.label}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Text Content */}
                        <div className="absolute bottom-0 left-0 w-full p-4">
                            <span className="text-[15px] font-bold text-white leading-tight block drop-shadow-md">
                                {card.label}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
            
            {/* Bottom actions: Ver todos + Soy profesional */}
            <div className="mt-5 flex flex-col items-center gap-3">
                <Link 
                    href={link(`/buscar?c=${encodeURIComponent(activeTab)}`)}
                    className="text-[14px] font-bold flex items-center gap-1.5 transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent)' }}
                >
                    Ver todos los profesionales en {TABS.find(t => t.query === activeTab)?.label}
                    <Icon name="arrow" size={16} />
                </Link>
            </div>
        </div>
    );
}
