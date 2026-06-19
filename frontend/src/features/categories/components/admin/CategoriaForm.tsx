'use client';

import { useId, useState } from 'react';

import { Search, X } from '@/shared/components/icons';

import { actualizarCategoria, crearCategoria } from '@/features/categories/actions';

import { CategoryIcon, ICON_NAMES } from '@/shared/components/icons/CategoryIcons';
import { Btn, Field, Input } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';

interface CategoriaServicio {
    id: string;
    nombre: string;
    nombreEn?: string | null;
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

function buildCategoryDescription(nombre: string, nombreEn: string | null): string {
    return nombreEn ? `${nombre} / ${nombreEn} (EN)` : nombre;
}

export default function CategoriaForm({ categoria, onSuccess, onCancel }: CategoriaFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(categoria?.icono || '');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [iconSearch, setIconSearch] = useState('');

    const nombreId = useId();
    const nombreEnId = useId();
    const ordenId = useId();

    const labels = categoria
        ? { success: 'Categoría actualizada', error: 'Error al actualizar categoría', submit: 'Actualizar' }
        : { success: 'Categoría creada', error: 'Error al crear categoría', submit: 'Crear' };

    const [visibleLimit, setVisibleLimit] = useState(50);

    const filteredIcons = ICON_NAMES.filter((iconName) =>
        iconName.toLowerCase().includes(iconSearch.toLowerCase()),
    );
    const visibleIcons = filteredIcons.slice(0, visibleLimit);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                nombre: formData.get('nombre') as string,
                nombreEn: (formData.get('nombreEn') as string) || null,
                icono: selectedIcon || null,
                orden: Number(formData.get('orden')),
                activo: categoria?.activo ?? true,
            };

            const result = categoria
                ? await actualizarCategoria({ ...data, id: categoria.id })
                : await crearCategoria(data);

            if (result.error) {
                setError(result.error);
                notify.error({ title: labels.error, description: result.error });
            } else {
                notify.success({
                    title: labels.success,
                    description: buildCategoryDescription(data.nombre, data.nombreEn),
                });
                onSuccess();
            }
        } catch (_err) {
            setError('Error al procesar la solicitud');
            notify.error({ title: 'Error al procesar la solicitud' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 transition-colors duration-300">
            {categoria && <input type="hidden" name="id" value={categoria.id} />}

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Nombre (Español)">
                    <Input
                        type="text"
                        id={nombreId}
                        name="nombre"
                        defaultValue={categoria?.nombre}
                        required
                        placeholder="Ej: Carpintero"
                    />
                </Field>

                <Field label="Nombre (Inglés)" optional hint="Usado en Estados Unidos">
                    <Input
                        type="text"
                        id={nombreEnId}
                        name="nombreEn"
                        defaultValue={categoria?.nombreEn ?? ''}
                        placeholder="Ej: Carpenter"
                    />
                </Field>
            </div>

            <div className="relative">
                <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink">
                    Icono
                </span>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-2.5 text-left text-ink transition-all hover:bg-tint focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none bg-bg"
                    >
                        <span className="flex items-center gap-3">
                            {selectedIcon ? (
                                <CategoryIcon
                                    name={selectedIcon}
                                    className="text-brand "
                                    size={20}
                                />
                            ) : (
                                <span className="text-muted">
                                    Seleccionar icono...
                                </span>
                            )}
                            <span className="text-sm font-medium">
                                {selectedIcon || 'Sin icono'}
                            </span>
                        </span>
                        <span className="text-xs font-semibold text-brand ">
                            Cambiar
                        </span>
                    </button>
                    {selectedIcon && (
                        <button
                            type="button"
                            onClick={() => setSelectedIcon('')}
                            className="cursor-pointer rounded-xl border border-line p-2.5 text-muted hover:bg-red-50 hover:text-red-600"
                            title="Quitar icono"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Icon Picker Dropdown */}
                {showIconPicker && (
                    <div className="mt-4 w-full overflow-hidden rounded-2xl border border-line bg-tint/50">
                        <div className="border-b border-line p-3">
                            <div className="flex items-center gap-2 rounded-xl bg-tint px-3">
                                <Search size={16} className="text-muted" />
                                <input
                                    type="text"
                                    placeholder="Buscar icono..."
                                    value={iconSearch}
                                    onChange={(e) => {
                                        setIconSearch(e.target.value);
                                        setVisibleLimit(50);
                                    }}
                                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted text-ink"
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
                                                ? 'bg-brand/5 text-brand ring-2 ring-brand ring-offset-1'
                                                : 'text-sub hover:bg-tint hover:text-ink'
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
                                    className="col-span-full mt-2 cursor-pointer rounded-lg bg-tint py-2 text-xs font-medium text-sub hover:bg-line"
                                >
                                    Cargar más ({filteredIcons.length - visibleLimit} restantes)
                                </button>
                            )}
                            {filteredIcons.length === 0 && (
                                <div className="col-span-full py-4 text-center text-xs text-muted">
                                    No se encontraron iconos
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Field label="Orden" hint="Menor número aparece primero.">
                <Input
                    type="number"
                    id={ordenId}
                    name="orden"
                    defaultValue={categoria?.orden || 0}
                    required
                />
            </Field>

            <div className="mt-8 flex justify-end gap-3">
                <Btn
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Btn>
                <Btn
                    type="submit"
                    variant="primary"
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : labels.submit}
                </Btn>
            </div>
        </form>
    );
}
