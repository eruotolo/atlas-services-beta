'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, type ReactElement } from 'react';
import { Search, Loader2, LocateFixed } from '@/shared/components/icons';
import { matchServiceCategory } from '@/features/services/actions/matchmaking';
import { searchLocalitiesByCountry } from '@/features/geo/actions/queries';
import { useDictionary } from '@/lib/i18n/useDictionary';

interface Props {
    country: string;
}

const DEFAULT_LOCATIONS: Record<string, string> = {
    cl: 'Santiago',
    ar: 'Buenos Aires',
    uy: 'Montevideo',
    es: 'Madrid',
    us: 'San Jose',
};

export function HeroSearchBar({ country }: Props): ReactElement {
    const router = useRouter();
    const dict = useDictionary();
    const s = dict.search;

    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [localities, setLocalities] = useState<{ id: string; name: string; slug: string; region?: { name: string } }[]>([]);
    const [selectedLocality, setSelectedLocality] = useState<{ slug: string } | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [isLocating, setIsLocating] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setLocation(DEFAULT_LOCATIONS[country] ?? s.capitalCity);
        searchLocalitiesByCountry(country).then(setLocalities);
    }, [country, s.capitalCity]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setShowDropdown(false);
        try {
            let redirectUrl = `/${country}/search`;
            const params = new URLSearchParams();

            if (selectedLocality) {
                params.set('locality', selectedLocality.slug);
            } else if (location === s.currentLocation && coords) {
                params.set('lat', String(coords.lat));
                params.set('lng', String(coords.lng));
            } else if (location.trim() && location !== s.currentLocation) {
                params.set('q', location);
            }

            if (query.trim()) {
                const categorySlug = await matchServiceCategory(query);
                params.set('c', categorySlug);
            }

            const queryString = params.toString();
            if (queryString) {
                redirectUrl += `?${queryString}`;
            }

            router.push(redirectUrl);
        } catch (error) {
            console.error('Error in matchmaking', error);
            router.push(`/${country}/search?q=${encodeURIComponent(query)}`);
            setIsSearching(false);
        }
    };

    const handleGeolocation = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (typeof window === 'undefined' || !('geolocation' in navigator)) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                setSelectedLocality(null);
                setShowDropdown(false);
                try {
                    const lang = country === 'us' ? 'en' : 'es';
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { 'Accept-Language': lang } }
                    );
                    const data = await res.json() as { address?: Record<string, string> };
                    const addr = data.address ?? {};
                    const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county ?? '';
                    const countryName = addr.country ?? '';
                    setLocation(city && countryName ? `${countryName}, ${city}` : s.currentLocation);
                } catch {
                    setLocation(s.currentLocation);
                }
                setIsLocating(false);
            },
            (error) => {
                console.warn('Geolocalización fallida', error);
                setIsLocating(false);
                alert(s.locationError || 'No pudimos obtener tu ubicación');
            },
            { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 }
        );
    };

    const filteredLocalities = location.trim() === ''
        ? localities.slice(0, 5)
        : localities.filter(l => l.name.toLowerCase().includes(location.toLowerCase())).slice(0, 5);

    return (
        <form
            onSubmit={handleSearch}
            className="relative z-20 mb-12 mt-6 flex w-full max-w-4xl flex-col items-stretch overflow-hidden rounded-2xl border border-line shadow-lg transition-all focus-within:ring-4 focus-within:ring-accent/30 hover:shadow-xl md:flex-row md:items-center md:rounded-full bg-bg"
        >
            {/* What do you need (AI) */}
            <div className="flex h-14 w-full shrink-0 items-center border-b border-line px-5 md:h-[64px] md:flex-1 md:shrink md:rounded-l-full md:border-r md:border-b-0 md:px-6">
                <Search size={20} className="text-sub shrink-0 mr-3" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={s.descriptionPlaceholder}
                    className="w-full bg-transparent border-none outline-none text-[15px] text-ink placeholder:text-sub"
                    autoComplete="off"
                />
            </div>

            {/* Location with Autocomplete */}
            <div className="relative flex h-14 w-full items-center px-5 md:h-[64px] md:w-[260px] md:px-6 bg-black/[0.01] dark:bg-white/[0.01]" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={handleGeolocation}
                    className="text-sub shrink-0 mr-3 hover:text-accent transition-colors"
                    title={s.useCurrentLocationTitle}
                >
                    {isLocating ? <Loader2 size={20} className="animate-spin text-accent" /> : <LocateFixed size={20} />}
                </button>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        setSelectedLocality(null);
                        setCoords(null);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={s.locationLabel}
                    className="w-full bg-transparent border-none outline-none text-[15px] text-ink placeholder:text-sub"
                    autoComplete="off"
                />

                {showDropdown && localities.length > 0 && (
                    <div className="absolute top-[60px] left-0 w-full bg-bg border border-line rounded-xl shadow-lg overflow-hidden z-50">
                        {filteredLocalities.length > 0 ? (
                            filteredLocalities.map((loc) => (
                                <button
                                    key={loc.id}
                                    type="button"
                                    onClick={() => {
                                        setLocation(loc.name);
                                        setSelectedLocality(loc);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors flex flex-col border-b border-line last:border-0"
                                >
                                    <span className="text-[14px] font-medium text-ink">{loc.name}</span>
                                    {loc.region && (
                                        <span className="text-[12px] text-sub">{loc.region.name}</span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-[13px] text-sub">{s.noCitiesFound}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Search Button */}
            <div className="w-full md:w-auto p-1.5 md:rounded-r-full overflow-hidden">
                <button
                    type="submit"
                    disabled={isSearching}
                    className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-8 text-[16px] font-bold text-white transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 md:h-[48px] md:w-auto"
                >
                    {isSearching ? <Loader2 className="animate-spin" size={18} /> : s.searchButton}
                </button>
            </div>
        </form>
    );
}
