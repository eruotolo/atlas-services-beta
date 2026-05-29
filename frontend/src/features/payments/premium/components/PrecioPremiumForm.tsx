'use client';

import { useState } from 'react';

import { Btn, Field, Input, Select } from '@/shared/components/hireeo';

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
                <div
                    className="rounded-xl border p-4 text-sm"
                    style={{
                        borderColor: 'var(--danger)',
                        background: 'var(--danger-soft)',
                        color: 'var(--danger)',
                    }}
                >
                    {error}
                </div>
            )}

            <Field
                label="Duración (meses)"
                hint={precioPremium ? 'La duración no puede ser modificada' : undefined}
            >
                <Select
                    name="duracionMeses"
                    defaultValue={precioPremium?.duracionMeses ?? ''}
                    required
                    disabled={!!precioPremium}
                >
                    <option value="">Seleccionar duración</option>
                    <option value="1">1 mes</option>
                    <option value="3">3 meses</option>
                    <option value="6">6 meses</option>
                    <option value="9">9 meses</option>
                    <option value="12">12 meses</option>
                </Select>
            </Field>

            <Field label="Precio (CLP)">
                <Input
                    type="number"
                    name="precio"
                    defaultValue={precioPremium?.precio ? Number(precioPremium.precio) : undefined}
                    required
                    min="0"
                    step="1"
                    placeholder="9990"
                />
            </Field>

            <Field label="Descripción" optional>
                <Input
                    type="text"
                    name="descripcion"
                    defaultValue={precioPremium?.descripcion || ''}
                    placeholder="Ej: 1 mes de servicio premium"
                />
            </Field>

            <div className="flex justify-end gap-3 border-t border-line pt-4">
                <Btn type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Btn>
                <Btn type="submit" variant="accent" disabled={loading}>
                    {loading ? 'Guardando...' : precioPremium ? 'Actualizar' : 'Crear'}
                </Btn>
            </div>
        </form>
    );
}
