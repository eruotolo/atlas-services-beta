'use client';

import { useState } from 'react';

import type { z } from 'zod';

import { actualizarPais, crearPais } from '@/features/configuration/countries/actions/mutations';
import { countryCreateSchema } from '@/features/configuration/countries/schemas/countrySchemas';
import type { Country } from '@/features/geo/types/geoTypes';
import {
    Form,
    FormError,
    FormInput,
    FormSelect,
    FormToggle,
    useZodForm,
} from '@/shared/components/Form';
import { Btn } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';

interface CountryFormProps {
    country?: Country;
    onSuccess: () => void;
    onCancel: () => void;
}

const GATEWAY_OPTIONS = [
    { value: 'MERCADOPAGO', label: 'MercadoPago' },
    { value: 'STRIPE', label: 'Stripe' },
] as const;

type CountryFormValues = z.output<typeof countryCreateSchema>;

export default function CountryForm({ country, onSuccess, onCancel }: CountryFormProps) {
    const [serverError, setServerError] = useState('');
    const isEdit = Boolean(country);

    const form = useZodForm(countryCreateSchema, {
        defaultValues: {
            code: country?.code ?? '',
            name: country?.name ?? '',
            currency: country?.currency ?? '',
            locale: country?.locale ?? '',
            timezone: country?.timezone ?? '',
            gateway: country?.gateway === 'STRIPE' ? 'STRIPE' : 'MERCADOPAGO',
            regionLabel: country?.regionLabel ?? '',
            localityLabel: country?.localityLabel ?? '',
            paymentsEnabled: country?.paymentsEnabled ?? true,
            active: country?.active ?? true,
        },
    });

    async function onSubmit(values: CountryFormValues): Promise<void> {
        setServerError('');
        try {
            const result = country
                ? await actualizarPais(country.code, {
                      name: values.name,
                      currency: values.currency,
                      locale: values.locale,
                      timezone: values.timezone,
                      gateway: values.gateway,
                      regionLabel: values.regionLabel,
                      localityLabel: values.localityLabel,
                      paymentsEnabled: values.paymentsEnabled,
                      active: values.active,
                  })
                : await crearPais({ ...values, code: values.code.toLowerCase() });

            if (result.error) {
                setServerError(result.error);
                notify.error({
                    title: country ? 'Error al actualizar país' : 'Error al crear país',
                    description: result.error,
                });
                return;
            }
            notify.success({
                title: country ? 'País actualizado' : 'País creado',
                description: values.name,
            });
            onSuccess();
        } catch {
            setServerError('Error al procesar la solicitud');
            notify.error({ title: 'Error al procesar la solicitud' });
        }
    }

    const loading = form.formState.isSubmitting;

    return (
        <Form form={form} onSubmit={onSubmit} className="space-y-5">
            <FormError message={serverError} />

            <div className="grid grid-cols-2 gap-4">
                {!isEdit && (
                    <FormInput
                        name="code"
                        label="Código ISO2"
                        hint="2 letras minúsculas (ISO 3166-1)"
                        maxLength={2}
                        placeholder="ej: cl"
                    />
                )}

                <div className={isEdit ? 'col-span-2' : ''}>
                    <FormInput name="name" label="Nombre del País" placeholder="ej: Chile" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormInput
                    name="currency"
                    label="Moneda (ISO 4217)"
                    maxLength={4}
                    placeholder="ej: CLP"
                />
                <FormInput name="locale" label="Locale" placeholder="ej: es-CL" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormInput
                    name="timezone"
                    label="Zona Horaria"
                    placeholder="ej: America/Santiago"
                />
                <FormSelect name="gateway" label="Pasarela de Pago" options={GATEWAY_OPTIONS} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormInput name="regionLabel" label="Etiqueta de Región" placeholder="ej: Región" />
                <FormInput
                    name="localityLabel"
                    label="Etiqueta de Localidad"
                    placeholder="ej: Comuna"
                />
            </div>

            <FormToggle
                name="paymentsEnabled"
                label="Pagos habilitados"
                description="Activa la pasarela de cobros en este país"
            />

            <FormToggle
                name="active"
                label="País activo"
                description="Habilita el país en la plataforma"
            />

            <div className="mt-8 flex justify-end gap-3">
                <Btn type="button" onClick={onCancel} disabled={loading} variant="secondary">
                    Cancelar
                </Btn>
                <Btn type="submit" disabled={loading} variant="primary">
                    {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear País'}
                </Btn>
            </div>
        </Form>
    );
}
