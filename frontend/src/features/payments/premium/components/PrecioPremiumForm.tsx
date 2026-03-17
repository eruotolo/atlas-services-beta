'use client';

import { useId, useState } from 'react';

import type { PrecioPremium } from '../../types/paymentTypes';
import { actualizarPrecioPremium, crearPrecioPremium } from '../actions';

interface PrecioPremiumFormProps {
    precioPremium?: PrecioPremium;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PrecioPremiumForm({
    precioPremium,
    onSuccess,
    onCancel,
}: PrecioPremiumFormProps) {
    const id = useId();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                duracionMeses: Number(formData.get('duracionMeses')),
                precio: Number(formData.get('precio')),
                descripcion: formData.get('descripcion') as string,
            };

            const result = precioPremium
                ? await actualizarPrecioPremium({ ...data, id: precioPremium.id })
                : await crearPrecioPremium(data);

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
            {precioPremium && (
                <>
                    <input type="hidden" name="id" value={precioPremium.id} />
                    <input type="hidden" name="duracionMeses" value={precioPremium.duracionMeses} />
                </>
            )}

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor={`${id}-duracionMeses`}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Duración (meses)
                </label>
                <select
                    id={`${id}-duracionMeses`}
                    name="duracionMeses"
                    defaultValue={precioPremium?.duracionMeses}
                    required
                    disabled={!!precioPremium}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-gray-50 disabled:opacity-60 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-950"
                >
                    <option value="" className="dark:bg-gray-900">
                        Seleccionar duración
                    </option>
                    <option value="1" className="dark:bg-gray-900">
                        1 mes
                    </option>
                    <option value="3" className="dark:bg-gray-900">
                        3 meses
                    </option>
                    <option value="6" className="dark:bg-gray-900">
                        6 meses
                    </option>
                    <option value="9" className="dark:bg-gray-900">
                        9 meses
                    </option>
                    <option value="12" className="dark:bg-gray-900">
                        12 meses
                    </option>
                </select>
                {precioPremium && (
                    <p className="mt-1 text-[10px] font-bold text-gray-500 uppercase dark:text-gray-600">
                        La duración no puede ser modificada
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor={`${id}-precio`}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Precio (CLP)
                </label>
                <input
                    type="number"
                    id={`${id}-precio`}
                    name="precio"
                    defaultValue={precioPremium?.precio ? Number(precioPremium.precio) : undefined}
                    required
                    min="0"
                    step="1"
                    placeholder="9990"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div>
                <label
                    htmlFor={`${id}-descripcion`}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Descripción (opcional)
                </label>
                <input
                    type="text"
                    id={`${id}-descripcion`}
                    name="descripcion"
                    defaultValue={precioPremium?.descripcion || ''}
                    placeholder="Ej: 1 mes de servicio premium"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
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
                    className="cursor-pointer rounded-xl bg-blue-500 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 dark:shadow-none"
                >
                    {loading ? 'Guardando...' : precioPremium ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
}
