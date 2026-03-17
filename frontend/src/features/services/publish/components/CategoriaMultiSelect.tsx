'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, Search, Tag, X } from 'lucide-react';

interface Categoria {
    id: string;
    nombre: string;
}

interface CategoriaMultiSelectProps {
    categorias: Categoria[];
    values: string[];
    onChange: (values: string[]) => void;
    disabled?: boolean;
    required?: boolean;
    maxSelections?: number;
}

export default function CategoriaMultiSelect({
    categorias,
    values,
    onChange,
    disabled = false,
    required = false,
    maxSelections = 3,
}: CategoriaMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedCategorias = categorias.filter((cat) => values.includes(cat.id));

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

    const handleToggle = (categoriaId: string) => {
        if (values.includes(categoriaId)) {
            // Remover
            onChange(values.filter((id) => id !== categoriaId));
        } else {
            // Agregar solo si no se alcanzó el límite
            if (values.length < maxSelections) {
                onChange([...values, categoriaId]);
            }
        }
    };

    const handleRemove = (categoriaId: string) => {
        onChange(values.filter((id) => id !== categoriaId));
    };

    return (
        <div ref={wrapperRef} className="relative">
            {/* Input visible (trigger) */}
            <div className="relative">
                <Tag
                    size={18}
                    className="pointer-events-none absolute top-3.5 left-4 z-10 text-gray-400 dark:text-gray-600"
                />
                {/* biome-ignore lint/a11y/useSemanticElements: Necesario usar div en lugar de button para evitar botones anidados (chips tienen botones de eliminar) */}
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    onKeyDown={(e) => {
                        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }
                    }}
                    className={`w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-3 pr-12 pl-12 text-left focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                        disabled
                            ? 'cursor-wait bg-gray-100 dark:bg-gray-900'
                            : 'dark:border-white/5 dark:bg-gray-800'
                    }`}
                >
                    {selectedCategorias.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedCategorias.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                    {cat.nombre}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(cat.id);
                                        }}
                                        className="hover:text-blue-900 dark:hover:text-blue-200"
                                        aria-label={`Eliminar ${cat.nombre}`}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-900 dark:text-white">
                            Selecciona hasta {maxSelections} categorías
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={18}
                    className={`pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-transform dark:text-gray-600 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </div>

            {/* Inputs hidden para validación del form */}
            {values.map((value, index) => (
                <input
                    key={value}
                    type="hidden"
                    name={`categoriasIds[${index}]`}
                    value={value}
                    required={required && index === 0}
                />
            ))}
            {values.length === 0 && required && (
                <input type="hidden" name="categoriasIds" value="" required />
            )}

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
                                className="w-full rounded-xl border border-gray-200 py-2 pr-3 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        {values.length > 0 && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                                {values.length} de {maxSelections} seleccionadas
                            </p>
                        )}
                    </div>

                    {/* Lista de opciones */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredCategorias.length > 0 ? (
                            filteredCategorias.map((cat) => {
                                const isSelected = values.includes(cat.id);
                                const isDisabled = !isSelected && values.length >= maxSelections;

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => !isDisabled && handleToggle(cat.id)}
                                        disabled={isDisabled}
                                        className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-900/20 ${
                                            isSelected
                                                ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                : 'text-gray-900 dark:text-gray-300'
                                        }`}
                                    >
                                        <span>{cat.nombre}</span>
                                        {isSelected && (
                                            <Check
                                                size={16}
                                                className="text-blue-700 dark:text-blue-400"
                                            />
                                        )}
                                    </button>
                                );
                            })
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
