'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, Search } from '@/shared/components/icons';

const COUNTRIES = [
    { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱', placeholder: '9 1234 5678' },
    { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', placeholder: '9 11 1234 5678' },
    { code: 'UY', name: 'Uruguay', dial: '+598', flag: '🇺🇾', placeholder: '99 123 456' },
    { code: 'ES', name: 'España', dial: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
    { code: 'US', name: 'Estados Unidos', dial: '+1', flag: '🇺🇸', placeholder: '202 555 0123' },
];

interface PhoneInputProps {
    name: string;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    required?: boolean;
    error?: string;
    label?: string;
    id?: string;
}

export default function PhoneInput({
    name,
    defaultValue = '',
    value,
    onChange,
    required,
    error,
    label,
    id,
}: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [phoneNumber, setPhoneNumber] = useState('');

    // Manejar cambios desde props (value o defaultValue)
    useEffect(() => {
        const valueToUse = value !== undefined ? value : defaultValue;
        if (valueToUse) {
            const found = COUNTRIES.find((c) => valueToUse.startsWith(c.dial));
            if (found) {
                setSelectedCountry(found);
                setPhoneNumber(valueToUse.replace(found.dial, ''));
            } else {
                setPhoneNumber(valueToUse);
            }
        } else if (value !== undefined && value === '') {
            // Si es controlado y llega vacío, limpiar
            setPhoneNumber('');
        }
    }, [defaultValue, value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = COUNTRIES.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search),
    );

    const fullValue = phoneNumber ? `${selectedCountry.dial}${phoneNumber.replace(/\s/g, '')}` : '';

    const handleCountryChange = (country: (typeof COUNTRIES)[0]) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearch('');
        const newFullValue = phoneNumber ? `${country.dial}${phoneNumber.replace(/\s/g, '')}` : '';
        onChange?.(newFullValue);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9\s]/g, '');
        setPhoneNumber(val);
        const newFullValue = val ? `${selectedCountry.dial}${val.replace(/\s/g, '')}` : '';
        onChange?.(newFullValue);
    };

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label
                    htmlFor={id}
                    className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink"
                >
                    {label}
                </label>
            )}

            <div
                className={`flex h-[50px] items-center overflow-hidden rounded-2xl border bg-bg transition-colors focus-within:border-ink ${
                    error ? 'border-red-500' : 'border-line'
                }`}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex h-full shrink-0 items-center gap-1.5 border-r border-line px-4 py-2 hover:bg-tint focus:outline-none"
                >
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span className="text-sm font-semibold text-sub">
                        {selectedCountry.dial}
                    </span>
                    <ChevronDown size={14} className="text-muted" />
                </button>

                <input
                    id={id}
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={selectedCountry.placeholder}
                    className="h-full w-full bg-transparent px-4 py-2 text-base text-ink placeholder:text-muted focus:outline-none"
                />

                <input type="hidden" name={name} value={fullValue} required={required} />
            </div>

            {error && <p className="mt-1 px-1 text-xs text-red-600">{error}</p>}

            {isOpen && (
                <div className="animate-in fade-in zoom-in-95 absolute top-full left-0 z-50 mt-2 w-full max-w-xs overflow-hidden rounded-2xl border border-line bg-bg shadow-xl">
                    <div className="border-b border-line p-2">
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                            />
                            <input
                                type="text"
                                placeholder="Buscar país..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl bg-tint py-2 pr-3 pl-9 text-xs text-ink outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>
                    <ul className="max-h-60 overflow-y-auto p-1">
                        {filteredCountries.map((country) => (
                            <li key={country.code}>
                                <button
                                    type="button"
                                    onClick={() => handleCountryChange(country)}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-brand/5 ${
                                        selectedCountry.code === country.code
                                            ? 'bg-brand/5'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{country.flag}</span>
                                        <span className="font-medium text-sub">
                                            {country.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted">
                                            {country.dial}
                                        </span>
                                        {selectedCountry.code === country.code && (
                                            <Check size={14} className="text-brand" />
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
