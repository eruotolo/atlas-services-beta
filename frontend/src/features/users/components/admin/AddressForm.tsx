'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';

import { Input, Select, Btn, Field } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { getRegionsByCountry, getLocalitiesByRegion } from '@/features/geo/actions/queries';
import {
    createUserAddress,
    updateUserAddress,
    type UserAddress,
    type AddressData,
} from '../../actions/addresses';

const MapPicker = dynamic(() => import('./MapPicker'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-line bg-bg/50 text-sub">
            Cargando mapa...
        </div>
    ),
});

interface Props {
    userId: string;
    address?: UserAddress | null;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function AddressForm({ userId, address, onCancel, onSuccess }: Props) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddressData>({
        defaultValues: {
            alias: address?.alias || '',
            street: address?.street || '',
            number: address?.number || '',
            apartment: address?.apartment || '',
            zipCode: address?.zipCode || '',
            reference: address?.reference || '',
            isDefault: address?.isDefault || false,
            countryId: address?.countryId || '',
            regionId: address?.regionId || '',
            localityId: address?.localityId || '',
            latitude: address?.latitude ? Number(address.latitude) : undefined,
            longitude: address?.longitude ? Number(address.longitude) : undefined,
        },
    });

    const [isSaving, setIsSaving] = useState(false);
    
    // Jerarquía Geográfica
    const [countries, setCountries] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [localities, setLocalities] = useState<any[]>([]);

    const watchCountry = watch('countryId');
    const watchRegion = watch('regionId');
    const watchLocality = watch('localityId');
    const watchStreet = watch('street');
    const watchNumber = watch('number');
    
    // Map state
    const [position, setPosition] = useState<[number, number] | null>(
        address?.latitude && address?.longitude 
            ? [Number(address.latitude), Number(address.longitude)]
            : null
    );

    useEffect(() => {
        getAdminCountries().then((data) => setCountries(data || []));
    }, []);

    useEffect(() => {
        if (watchCountry) {
            const country = countries.find(c => c.id === watchCountry);
            if (country) {
                getRegionsByCountry(country.code).then(setRegions);
            }
        } else {
            setRegions([]);
            setLocalities([]);
        }
    }, [watchCountry, countries]);

    useEffect(() => {
        if (watchRegion) {
            getLocalitiesByRegion(watchRegion).then(setLocalities);
        } else {
            setLocalities([]);
        }
    }, [watchRegion]);

    const initialValuesRef = useRef({
        countryId: address?.countryId || '',
        regionId: address?.regionId || '',
        localityId: address?.localityId || '',
        street: address?.street || '',
        number: address?.number || ''
    });

    // Geocoding effect
    useEffect(() => {
        if (watchCountry && watchRegion && watchLocality) {
            // Skip geocoding on mount if editing and values haven't changed,
            // to avoid overwriting the user's saved pin coordinates.
            if (
                address &&
                watchCountry === initialValuesRef.current.countryId &&
                watchRegion === initialValuesRef.current.regionId &&
                watchLocality === initialValuesRef.current.localityId &&
                watchStreet === initialValuesRef.current.street &&
                watchNumber === initialValuesRef.current.number
            ) {
                return;
            }

            const country = countries.find(c => c.id === watchCountry);
            const region = regions.find(r => r.id === watchRegion);
            const locality = localities.find(l => l.id === watchLocality);
            
            if (country && region && locality) {
                const timeoutId = setTimeout(() => {
                    const searchGeocode = async () => {
                        const streetQuery = [watchStreet, watchNumber].filter(Boolean).join(' ');
                        const queries = [];
                        
                        if (streetQuery) {
                            queries.push(`${streetQuery}, ${locality.name}, ${region.name}, ${country.name}`);
                        }
                        queries.push(`${locality.name}, ${region.name}, ${country.name}`);
                        queries.push(`${region.name}, ${country.name}`);
                        queries.push(country.name);

                        for (const query of queries) {
                            try {
                                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
                                const data = await res.json();
                                if (data && data.length > 0) {
                                    const lat = parseFloat(data[0].lat);
                                    const lon = parseFloat(data[0].lon);
                                    setPosition([lat, lon]);
                                    setValue('latitude', lat);
                                    setValue('longitude', lon);
                                    return; // Stop if found
                                }
                            } catch (e) {
                                console.error('Geocoding error', e);
                            }
                        }
                        
                        // Si todo falla, mostrar el mapa en (0,0) para que no quede oculto
                        setPosition([0, 0]);
                        setValue('latitude', 0);
                        setValue('longitude', 0);
                    };

                    searchGeocode();
                }, 1000); // 1 segundo de espera (debounce) para no saturar la API

                return () => clearTimeout(timeoutId);
            }
        }
    }, [watchCountry, watchRegion, watchLocality, watchStreet, watchNumber, countries, regions, localities, address, setValue]);

    function handleMapChange(pos: [number, number]) {
        setPosition(pos);
        setValue('latitude', pos[0]);
        setValue('longitude', pos[1]);
    }

    async function onSubmit(data: AddressData) {
        setIsSaving(true);
        const result = address
            ? await updateUserAddress(userId, address.id, data)
            : await createUserAddress(userId, data);
            
        setIsSaving(false);

        if (result.error) {
            notify.error({ title: 'Error', description: result.error });
        } else {
            notify.success({ title: address ? 'Dirección actualizada' : 'Dirección creada' });
            onSuccess();
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-ink">Información Básica</h3>
                    
                    <Field label="Alias" optional>
                        <Input
                            placeholder="Ej. Casa, Oficina"
                            {...register('alias')}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Calle *" error={errors.street?.message}>
                            <Input
                                placeholder="Ej. Av. Siempre Viva"
                                {...register('street', { required: 'Calle es requerida' })}
                            />
                        </Field>
                        <Field label="Número *" error={errors.number?.message}>
                            <Input
                                placeholder="Ej. 742"
                                {...register('number', { required: 'Número es requerido' })}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Dpto/Oficina" optional>
                            <Input
                                placeholder="Ej. 1A"
                                {...register('apartment')}
                            />
                        </Field>
                        <Field label="Código Postal" optional>
                            <Input
                                placeholder="Ej. 1000"
                                {...register('zipCode')}
                            />
                        </Field>
                    </div>

                    <Field label="Referencia" optional>
                        <Input
                            placeholder="Ej. Frente al parque"
                            {...register('reference')}
                        />
                    </Field>

                    <div className="pt-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                            {...register('isDefault')}
                        />
                        <label htmlFor="isDefault" className="text-sm text-ink">
                            Establecer como dirección predeterminada
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-ink">Ubicación Geográfica</h3>
                    
                    <Field label="País *" error={errors.countryId?.message}>
                        <Select
                            {...register('countryId', { required: 'País es requerido' })}
                        >
                            <option value="">Selecciona país</option>
                            {countries.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Región/Provincia *" error={errors.regionId?.message}>
                        <Select
                            disabled={!watchCountry || regions.length === 0}
                            {...register('regionId', { required: 'Región es requerida' })}
                        >
                            <option value="">Selecciona región</option>
                            {regions.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Ciudad/Comuna *" error={errors.localityId?.message}>
                        <Select
                            disabled={!watchRegion || localities.length === 0}
                            {...register('localityId', { required: 'Ciudad es requerida' })}
                        >
                            <option value="">Selecciona ciudad</option>
                            {localities.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </Select>
                    </Field>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-ink">Mapa de Ubicación</h3>
                <p className="text-xs text-sub">
                    Arrastra el pin para ubicar exactamente la dirección.
                </p>
                {position ? (
                    <MapPicker position={position} onChange={handleMapChange} />
                ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-line bg-bg text-sm text-sub">
                        Selecciona un País, Región y Ciudad para mostrar el mapa.
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <Btn type="button" onClick={onCancel} variant="secondary">
                    Cancelar
                </Btn>
                <Btn type="submit" variant="primary" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : address ? 'Actualizar Dirección' : 'Guardar Dirección'}
                </Btn>
            </div>
        </form>
    );
}
