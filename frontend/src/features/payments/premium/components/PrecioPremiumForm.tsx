'use client';

import { useState } from 'react';

import type { Country } from '@/features/geo/types/geoTypes';
import { Btn, Field, Input, Select } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';

import type { PrecioPremium } from '../../types/paymentTypes';
import { actualizarPrecioPremium, crearPrecioPremium } from '../actions';

interface PrecioPremiumFormProps {
    precioPremium?: PrecioPremium;
    /** Duración prefijada al agregar desde una tarjeta de duración */
    defaultDuracion?: number;
    countries: Country[];
    onSuccess: () => void;
    onCancel: () => void;
}

const DURACIONES = [
    { value: 1, label: '1 mes' },
    { value: 3, label: '3 meses' },
    { value: 6, label: '6 meses' },
    { value: 9, label: '9 meses' },
    { value: 12, label: '12 meses' },
] as const;

export default function PrecioPremiumForm({
    precioPremium,
    defaultDuracion,
    countries,
    onSuccess,
    onCancel,
}: PrecioPremiumFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // País seleccionado — determina la moneda automáticamente
    const [selectedCountryCode, setSelectedCountryCode] = useState(
        precioPremium?.countryCode ?? countries[0]?.code ?? '',
    );

    const selectedCountry = countries.find((c) => c.code === selectedCountryCode);

    const isEditing = !!precioPremium;
    const duracionFixed = isEditing || !!defaultDuracion;
    // Solo pre-seleccionamos si viene una duración fija; de lo contrario dejamos el select vacío
    const duracionValue = precioPremium?.duracionMeses ?? defaultDuracion;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const country = countries.find((c) => c.code === formData.get('countryCode'));

        try {
            if (isEditing && precioPremium) {
                const result = await actualizarPrecioPremium({
                    id: precioPremium.id,
                    precio: Number(formData.get('precio')),
                    currency: country?.currency ?? precioPremium.currency ?? 'CLP',
                    descripcion: formData.get('descripcion') as string,
                });
                if (result.error) {
                    setError(result.error);
                    notify.error({ title: 'Error al actualizar precio', description: result.error });
                } else {
                    notify.success({ title: 'Precio actualizado' });
                    onSuccess();
                }
            } else {
                if (!country) {
                    setError('Selecciona un país válido');
                    notify.warning({ title: 'Selecciona un país válido' });
                    setLoading(false);
                    return;
                }
                const result = await crearPrecioPremium({
                    countryId: country.id,
                    duracionMeses: Number(formData.get('duracionMeses')),
                    precio: Number(formData.get('precio')),
                    currency: country.currency,
                    descripcion: formData.get('descripcion') as string,
                });
                if (result.error) {
                    setError(result.error);
                    notify.error({ title: 'Error al crear precio', description: result.error });
                } else {
                    notify.success({
                        title: 'Precio creado',
                        description: `${country.name} · ${country.currency}`,
                    });
                    onSuccess();
                }
            }
        } catch {
            setError('Error al procesar la solicitud');
            notify.error({ title: 'Error al procesar la solicitud' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* País (solo en creación) */}
            {!isEditing && (
                <Field label="País">
                    <Select
                        name="countryCode"
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        required
                    >
                        {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.currency})
                            </option>
                        ))}
                    </Select>
                </Field>
            )}

            {/* País (display solo en edición) */}
            {isEditing && precioPremium?.countryName && (
                <div
                    className="rounded-xl px-4 py-3 text-[13px]"
                    style={{ background: 'var(--tint)', color: 'var(--sub)' }}
                >
                    País: <strong style={{ color: 'var(--ink)' }}>{precioPremium.countryName}</strong>
                    {precioPremium.currency && (
                        <> · Moneda: <strong style={{ color: 'var(--ink)' }}>{precioPremium.currency}</strong></>
                    )}
                </div>
            )}

            {/* Duración */}
            <Field
                label="Duración"
                hint={duracionFixed ? 'La duración no puede modificarse desde aquí' : undefined}
            >
                {duracionFixed ? (
                    <>
                        <input type="hidden" name="duracionMeses" value={duracionValue} />
                        <div
                            className="rounded-xl px-4 py-3 text-[13px] font-semibold"
                            style={{ background: 'var(--tint)', color: 'var(--ink)' }}
                        >
                            {DURACIONES.find((d) => d.value === duracionValue)?.label ?? `${duracionValue} meses`}
                        </div>
                    </>
                ) : (
                    <Select name="duracionMeses" defaultValue="" required>
                        <option value="" disabled>
                            Seleccionar duración…
                        </option>
                        {DURACIONES.map((d) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>

            {/* Precio */}
            <Field
                label={`Precio${selectedCountry ? ` (${selectedCountry.currency})` : ''}`}
            >
                <Input
                    type="number"
                    name="precio"
                    defaultValue={precioPremium?.precio ? Number(precioPremium.precio) : undefined}
                    required
                    min="0"
                    step="1"
                    placeholder={selectedCountry?.currency === 'USD' ? '9.99' : '9990'}
                />
            </Field>

            {/* Descripción */}
            <Field label="Descripción" optional>
                <Input
                    type="text"
                    name="descripcion"
                    defaultValue={precioPremium?.descripcion || ''}
                    placeholder="Ej: Plan mensual profesional"
                />
            </Field>

            <div className="mt-8 flex justify-end gap-3">
                <Btn type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Btn>
                <Btn type="submit" variant="accent" disabled={loading}>
                    {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear precio'}
                </Btn>
            </div>
        </form>
    );
}
