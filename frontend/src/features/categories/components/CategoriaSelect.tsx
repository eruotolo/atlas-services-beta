'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDown, Search, Tag } from 'lucide-react';

interface Categoria {
    id: string;
    nombre: string;
}

interface CategoriaSelectProps {
    categorias: Categoria[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
}

export default function CategoriaSelect({
    categorias,
    value,
    onChange,
    disabled = false,
    required = false,
}: CategoriaSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedCategoria = categorias.find((cat) => cat.id === value);

    const filteredCategorias = categorias.filter((cat) =>
        cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (categoriaId: string) => {
        onChange(categoriaId);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={wrapperRef} className="relative">
            {/* Input visible (trigger) */}
            <div className="relative">
                <Tag
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-gray-400"
                />
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-3 pr-12 pl-12 text-left text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none disabled:cursor-wait disabled:bg-gray-100 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900"
                >
                    {selectedCategoria ? selectedCategoria.nombre : 'Selecciona una categoría'}
                </button>
                <ChevronDown
                    size={18}
                    className={`pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </div>

            {/* Input hidden para validación del form */}
            <input
                type="hidden"
                name="categoriaId"
                value={value}
                required={required}
                onChange={() => {
                    // Controlado externamente
                }}
            />

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-gray-900 dark:shadow-none">
                    {/* Input de búsqueda */}
                    <div className="border-b border-gray-200 p-3 dark:border-white/5">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar categoría..."
                                className="w-full rounded-xl border border-gray-200 py-2 pr-3 pl-10 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Lista de opciones */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredCategorias.length > 0 ? (
                            filteredCategorias.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleSelect(cat.id)}
                                    className={`w-full cursor-pointer px-4 py-3 text-left text-sm transition-colors hover:bg-brand/5 dark:hover:bg-brand/10 ${
                                        cat.id === value
                                            ? 'bg-brand/5 font-semibold text-brand-hover dark:bg-brand-marino/40 dark:text-brand-light'
                                            : 'text-gray-900 dark:text-gray-300'
                                    }`}
                                >
                                    {cat.nombre}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-500">
                                No se encontraron categorías
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
