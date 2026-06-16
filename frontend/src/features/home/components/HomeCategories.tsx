'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import { Icon } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';
import type { Dictionary } from '@/lib/i18n/types';

interface Props {
    categoriesTabs: Dictionary['home']['categoriesTabs'];
}

export function HomeCategories({ categoriesTabs }: Props): ReactElement {
    const link = useCountryLink();
    const firstTab = categoriesTabs.tabs[0];
    const [activeTab, setActiveTab] = useState<string>(firstTab?.query ?? 'Hogar');

    const currentCards = categoriesTabs.cards[activeTab] ?? categoriesTabs.cards[firstTab?.query ?? 'Hogar'] ?? [];
    const activeTabLabel = categoriesTabs.tabs.find(t => t.query === activeTab)?.label ?? '';

    return (
        <div className="w-full mt-14">
            {/* Top Navigation Row */}
            <div
                className="mb-8 flex items-center justify-center gap-10 overflow-x-auto border-b py-6"
                style={{ borderColor: 'var(--line)', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                {categoriesTabs.tabs.map((tab) => {
                    const isActive = activeTab === tab.query;
                    return (
                        <button
                            type="button"
                            key={tab.label}
                            onClick={() => setActiveTab(tab.query)}
                            className={`group flex cursor-pointer flex-col items-center gap-2.5 min-w-max transition-colors ${
                                isActive ? 'text-[var(--accent)]' : 'text-[var(--sub)] hover:text-[var(--accent)]'
                            }`}
                        >
                            <div
                                className={`flex h-[52px] w-[52px] items-center justify-center rounded-full transition-all group-hover:scale-105 group-hover:bg-[var(--accent)] group-hover:border-transparent ${
                                    isActive
                                        ? 'bg-[var(--accent)] border-transparent'
                                        : 'bg-[var(--tint)] border-[var(--line)] border'
                                }`}
                            >
                                <Icon 
                                    name={tab.icon as HireIconName} 
                                    size={22} 
                                    className={`transition-colors group-hover:text-white ${isActive ? 'text-white' : 'text-[var(--sub)]'}`} 
                                />
                            </div>
                            <span
                                className={`text-[13px] transition-colors group-hover:text-[var(--ink)] ${
                                    isActive ? 'text-[var(--ink)] font-bold' : 'text-[var(--sub)] font-medium'
                                }`}
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
                        key={card.label + String(idx)}
                        href={link(`/search?c=${encodeURIComponent(card.query)}`)}
                        className="animate-in fade-in group relative h-[250px] overflow-hidden rounded-[14px] bg-tint transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
                        style={{ animationFillMode: 'both', animationDelay: `${idx * 50}ms` }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={card.image}
                            alt={card.label}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full p-4">
                            <span className="text-[15px] font-bold text-white leading-tight block drop-shadow-md">
                                {card.label}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom: View all */}
            <div className="mt-5 flex flex-col items-center gap-3">
                <Link
                    href={link(`/search?c=${encodeURIComponent(activeTab)}`)}
                    className="text-[14px] font-bold flex items-center gap-1.5 transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent)' }}
                >
                    {categoriesTabs.viewAllPrefix} {activeTabLabel}
                    <Icon name="arrow" size={16} />
                </Link>
            </div>
        </div>
    );
}
