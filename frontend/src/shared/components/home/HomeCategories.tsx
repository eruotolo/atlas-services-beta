'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import { Icon } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';

const TABS: Array<{ label: string; icon: HireIconName; query: string }> = [
    { label: 'Hogar & Casa', icon: 'home', query: 'Hogar' },
    { label: 'Reparaciones', icon: 'hammer', query: 'Reparaciones' },
    { label: 'Limpieza', icon: 'sparkle', query: 'Limpieza' },
    { label: 'Jardín & Exteriores', icon: 'leaf', query: 'Exteriores' },
    { label: 'Cuidado Infantil', icon: 'baby', query: 'Cuidado Infantil' },
    { label: 'Mascotas', icon: 'dog', query: 'Mascotas' },
    { label: 'Plagas', icon: 'bug', query: 'Plagas' },
    { label: 'Belleza', icon: 'user', query: 'Belleza' },
    { label: 'Eventos', icon: 'cam', query: 'Eventos' },
    { label: 'Transporte', icon: 'truck', query: 'Fletes' },
    { label: 'Profesionales', icon: 'briefcase', query: 'Legal' },
];

const CARDS = [
    {
        label: 'House Cleaning',
        query: 'Limpieza',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop',
    },
    {
        label: 'Landscaping',
        query: 'Paisajismo',
        image: 'https://images.unsplash.com/photo-1558904541-efa843a96f0f?q=80&w=600&auto=format&fit=crop',
    },
    {
        label: 'Senior Care',
        query: 'Cuidado de Adultos',
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop',
    },
    {
        label: 'Pet Sitting',
        query: 'Mascotas',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop',
    },
    {
        label: 'Babysitters',
        query: 'Niñeras',
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop',
    },
    {
        label: 'Repairs',
        query: 'Reparaciones',
        image: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=600&auto=format&fit=crop',
    },
];

export function HomeCategories(): ReactElement {
    const link = useCountryLink();

    return (
        <div className="w-full mt-10">
            {/* Top Navigation Row (Thumbtack style) */}
            <div 
                className="mb-8 flex items-center justify-start gap-8 overflow-x-auto border-b pb-6"
                style={{ borderColor: 'var(--line)', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                {TABS.map((tab) => (
                    <Link
                        key={tab.label}
                        href={link(`/buscar?c=${encodeURIComponent(tab.query)}`)}
                        className="group flex flex-col items-center gap-2.5 min-w-max transition-colors"
                        style={{ color: 'var(--sub)' }}
                    >
                        <div 
                            className="flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform group-hover:scale-105"
                            style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}
                        >
                            <Icon name={tab.icon} size={22} className="transition-colors group-hover:text-ink" style={{ color: 'var(--ink)' }} />
                        </div>
                        <span className="text-[13px] font-medium group-hover:text-ink transition-colors">
                            {tab.label}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Grid of Visual Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {CARDS.map((card) => (
                    <Link
                        key={card.label}
                        href={link(`/buscar?c=${encodeURIComponent(card.query)}`)}
                        className="group relative aspect-[3/4] overflow-hidden rounded-[14px] bg-tint transition-all hover:shadow-lg hover:-translate-y-1"
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
        </div>
    );
}
