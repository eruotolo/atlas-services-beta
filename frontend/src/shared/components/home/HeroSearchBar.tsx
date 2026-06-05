'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, type ReactElement } from 'react';
import { Search, MapPin, Loader2, LocateFixed } from 'lucide-react';
import { matchServiceCategory } from '@/features/services/actions/matchmaking';
import { searchLocalitiesByCountry } from '@/features/geo/actions/queries';

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

const LOCATION_LABELS: Record<string, string> = {
    cl: 'Comuna o Región',
    ar: 'Barrio o Provincia',
    uy: 'Ciudad o Departamento',
    es: 'Municipio o Provincia',
    us: 'ZIP Code / City',
};

export function HeroSearchBar({ country }: Props): ReactElement {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Estado para autocompletado
    const [localities, setLocalities] = useState<any[]>([]);
    const [selectedLocality, setSelectedLocality] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Estado de geolocalización
    const [isLocating, setIsLocating] = useState(false);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cargar localidades al montar
    useEffect(() => {
        setLocation(DEFAULT_LOCATIONS[country] || 'Ciudad Capital');
        searchLocalitiesByCountry(country).then(setLocalities);
    }, [country]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setShowDropdown(false);
        try {
            let redirectUrl = `/${country}/buscar`;
            const params = new URLSearchParams();

            if (selectedLocality && selectedLocality.region) {
                params.set('region', selectedLocality.region.code);
                params.set('locality', selectedLocality.slug);
            } else if (location.trim() && location !== 'Ubicación Actual') {
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
            router.push(`/${country}/buscar?q=${encodeURIComponent(query)}`);
            setIsSearching(false);
        }
    };

    const handleGeolocation = () => {
        if (!('geolocation' in navigator)) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Aquí podrías conectar a un API de Reverse Geocoding real.
                // Por ahora usamos una simulación visual de éxito.
                setLocation('Ubicación Actual');
                setIsLocating(false);
                setShowDropdown(false);
            },
            (error) => {
                console.warn('Geolocalización fallida', error);
                setIsLocating(false);
            }
        );
    };

    // Filtrar ciudades
    const filteredLocalities = location.trim() === '' 
        ? localities.slice(0, 5) 
        : localities.filter(l => l.name.toLowerCase().includes(location.toLowerCase())).slice(0, 5);

    const locationLabel = LOCATION_LABELS[country] || 'Ubicación';

    return (
        <form 
            onSubmit={handleSearch}
            className="flex w-full flex-col md:flex-row items-center bg-bg rounded-xl md:rounded-full border border-line shadow-sm mt-6 mb-12 transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-accent/50 relative z-20"
        >
            {/* Campo 1: Qué necesitas (IA) */}
            <div className="flex-1 w-full flex items-center px-6 py-4 md:py-0 h-[56px] border-b md:border-b-0 md:border-r border-line overflow-hidden md:rounded-l-full">
                <Search size={20} className="text-sub shrink-0 mr-3" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe el problema (ej: tengo una fuga en el baño)"
                    className="w-full bg-transparent border-none outline-none text-[15px] text-ink placeholder:text-sub"
                    autoComplete="off"
                />
            </div>

            {/* Campo 2: Ubicación con Autocompletado */}
            <div className="w-full md:w-[300px] flex items-center px-6 py-4 md:py-0 h-[56px] bg-black/[0.01] dark:bg-white/[0.01] relative" ref={dropdownRef}>
                <button 
                    type="button" 
                    onClick={handleGeolocation}
                    className="text-sub shrink-0 mr-3 hover:text-accent transition-colors"
                    title="Usar mi ubicación actual"
                >
                    {isLocating ? <Loader2 size={20} className="animate-spin text-accent" /> : <LocateFixed size={20} />}
                </button>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        setSelectedLocality(null);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={locationLabel}
                    className="w-full bg-transparent border-none outline-none text-[15px] text-ink placeholder:text-sub"
                    autoComplete="off"
                />

                {/* Dropdown de sugerencias */}
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
                            <div className="px-4 py-3 text-[13px] text-sub">No se encontraron ciudades con ese nombre.</div>
                        )}
                    </div>
                )}
            </div>

            {/* Botón de Búsqueda */}
            <div className="w-full md:w-auto p-1.5 md:rounded-r-full overflow-hidden">
                <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full md:w-auto flex items-center justify-center gap-2 rounded-full px-8 h-[44px] bg-accent text-white font-bold text-[15px] transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Buscar'}
                </button>
            </div>
        </form>
    );
}
