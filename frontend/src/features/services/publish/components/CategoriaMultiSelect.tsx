'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, Search, Tag, X } from '@/shared/components/icons';

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
                    className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-muted"
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
                    className={`w-full cursor-pointer appearance-none rounded-2xl border border-line bg-bg py-3 pr-10 pl-10 text-left text-base transition-colors focus:border-ink focus:outline-none ${
                        disabled ? 'cursor-wait bg-tint' : ''
                    }`}
                >
                    {selectedCategorias.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedCategorias.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="inline-flex items-center gap-1 rounded-lg bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-hover"
                                >
                                    {cat.nombre}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(cat.id);
                                        }}
                                        className="hover:text-brand-marino"
                                        aria-label={`Eliminar ${cat.nombre}`}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-ink">
                            Selecciona hasta {maxSelections} categorías
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={18}
                    className={`pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted transition-transform ${
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
                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-line bg-bg shadow-lg">
                    {/* Input de búsqueda */}
                    <div className="border-b border-line p-3">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar categoría..."
                                className="w-full rounded-xl border border-line py-2 pr-3 pl-10 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
                            />
                        </div>
                        {values.length > 0 && (
                            <p className="mt-2 text-xs text-muted">
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
                                        className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                                            isSelected
                                                ? 'bg-brand/5 font-semibold text-brand-hover'
                                                : 'text-ink'
                                        }`}
                                    >
                                        <span>{cat.nombre}</span>
                                        {isSelected && (
                                            <Check
                                                size={16}
                                                className="text-brand-hover"
                                            />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-center text-sm text-muted">
                                No se encontraron categorías
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
