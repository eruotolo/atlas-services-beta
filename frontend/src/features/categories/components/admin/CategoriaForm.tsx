'use client';

import { useId, useState } from 'react';

import { Search, X } from 'lucide-react';

import { actualizarCategoria, crearCategoria } from '@/features/categories/actions';

import { CategoryIcon, ICON_NAMES } from '@/shared/components/icons/CategoryIcons';

interface CategoriaServicio {
    id: string;
    nombre: string;
    slug: string;
    icono: string | null;
    orden: number;
    activo: boolean;
}

interface CategoriaFormProps {
    categoria?: CategoriaServicio;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CategoriaForm({ categoria, onSuccess, onCancel }: CategoriaFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(categoria?.icono || '');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [iconSearch, setIconSearch] = useState('');

    const nombreId = useId();
    const ordenId = useId();

    const [visibleLimit, setVisibleLimit] = useState(50);

    const filteredIcons = ICON_NAMES.filter((iconName) =>
        iconName.toLowerCase().includes(iconSearch.toLowerCase()),
    );
    const visibleIcons = filteredIcons.slice(0, visibleLimit);

    // Reset limit when search changes
    if (visibleLimit !== 50 && iconSearch !== '' && visibleIcons.length < 50) {
        // Optimization: usually handled in useEffect or handler, but simple reset on search change is needed.
        // Better to do it in the onChange handler.
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                nombre: formData.get('nombre') as string,
                icono: selectedIcon || null,
                orden: Number(formData.get('orden')),
                activo: categoria ? categoria.activo : true,
            };

            const result = categoria
                ? await actualizarCategoria({ ...data, id: categoria.id })
                : await crearCategoria(data);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        } catch (_err) {
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 transition-colors duration-300">
            {categoria && <input type="hidden" name="id" value={categoria.id} />}

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor={nombreId}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Nombre de la Categoría
                </label>
                <input
                    type="text"
                    id={nombreId}
                    name="nombre"
                    defaultValue={categoria?.nombre}
                    required
                    placeholder="Ej: Gasfitería"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div className="relative">
                <span className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                    Icono
                </span>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 px-4 py-2.5 text-left text-gray-900 transition-all hover:bg-gray-50 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    >
                        <span className="flex items-center gap-3">
                            {selectedIcon ? (
                                <CategoryIcon
                                    name={selectedIcon}
                                    className="text-brand dark:text-brand-light"
                                    size={20}
                                />
                            ) : (
                                <span className="text-gray-400 dark:text-gray-600">
                                    Seleccionar icono...
                                </span>
                            )}
                            <span className="text-sm font-medium">
                                {selectedIcon || 'Sin icono'}
                            </span>
                        </span>
                        <span className="text-xs font-bold text-brand dark:text-brand-light">
                            Cambiar
                        </span>
                    </button>
                    {selectedIcon && (
                        <button
                            type="button"
                            onClick={() => setSelectedIcon('')}
                            className="cursor-pointer rounded-xl border border-gray-200 p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:border-white/5 dark:hover:bg-red-950/30"
                            title="Quitar icono"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Icon Picker Dropdown */}
                {showIconPicker && (
                    <div className="mt-4 w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-gray-800/50">
                        <div className="border-b border-gray-100 p-3 dark:border-white/5">
                            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800">
                                <Search size={16} className="text-gray-400 dark:text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Buscar icono..."
                                    value={iconSearch}
                                    onChange={(e) => {
                                        setIconSearch(e.target.value);
                                        setVisibleLimit(50);
                                    }}
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 p-3 sm:grid-cols-8">
                            {visibleIcons.map((iconName) => {
                                const isSelected = selectedIcon === iconName;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => {
                                            setSelectedIcon(iconName);
                                            setShowIconPicker(false);
                                        }}
                                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all ${
                                            isSelected
                                                ? 'bg-brand/5 text-brand ring-2 ring-brand ring-offset-1 dark:bg-brand-marino/30 dark:text-brand-light dark:ring-brand dark:ring-offset-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                                        }`}
                                        title={iconName}
                                    >
                                        <CategoryIcon name={iconName} size={24} />
                                    </button>
                                );
                            })}
                            {filteredIcons.length > visibleLimit && (
                                <button
                                    type="button"
                                    onClick={() => setVisibleLimit((prev) => prev + 50)}
                                    className="col-span-full mt-2 cursor-pointer rounded-lg bg-gray-100 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cargar más ({filteredIcons.length - visibleLimit} restantes)
                                </button>
                            )}
                            {filteredIcons.length === 0 && (
                                <div className="col-span-full py-4 text-center text-xs text-gray-400">
                                    No se encontraron iconos
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label
                    htmlFor={ordenId}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Orden
                </label>
                <input
                    type="number"
                    id={ordenId}
                    name="orden"
                    defaultValue={categoria?.orden || 0}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[10px] tracking-tight text-gray-400 uppercase">
                    Menor número aparece primero.
                </p>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 dark:border-white/5">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="cursor-pointer rounded-xl border border-gray-200 px-6 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary cursor-pointer rounded-xl px-6 py-2.5 text-xs disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
}
