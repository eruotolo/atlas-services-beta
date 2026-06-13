'use client';

import { useState } from 'react';

import Image from 'next/image';

import { X } from '@/shared/components/icons';
import { ImageDropzone } from '@/shared/components/ImageDropzone';

import type { Country } from '@/features/geo/types/geoTypes';
import { actualizarSponsor, crearSponsor } from '@/features/sponsors/actions';
import { useCountry } from '@/lib/providers/CountryProvider';
import { Btn, Field, Input, Select } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';

import type { CategoriaSponsor, Sponsor } from '../../types/sponsorTypes';

interface SponsorFormProps {
    sponsor?: Sponsor;
    countries?: Country[];
    onSuccess: () => void;
    onCancel: () => void;
}

const GLOBAL_OPTION = '';

interface CountryOption {
    code: string;
    name: string;
}

function buildPublicationDescription(code: string, options: CountryOption[]): string {
    if (!code) return 'Publicado en todos los países (Global)';
    const name = options.find((c) => c.code === code)?.name ?? code;
    return `Publicado en ${name}`;
}

async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folder', 'sponsors');

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        let errorMessage = 'Error al subir la imagen';
        try {
            const errorData = await response.json();
            if (errorData.error) {
                errorMessage = errorData.details || errorData.error;
            }
        } catch (_e) {
            // Si no es JSON, mantenemos el mensaje genérico
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.urls[0];
}

async function resolveImagenUrl(file: File | null, currentUrl?: string): Promise<string> {
    if (file) return uploadImage(file);
    if (currentUrl) return currentUrl;
    throw new Error('Debes subir una imagen');
}

export default function SponsorForm({
    sponsor,
    countries = [],
    onSuccess,
    onCancel,
}: SponsorFormProps) {
    const scopeCountry = useCountry();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(sponsor?.nivel || 'STANDARD');
    const [selectedCountry, setSelectedCountry] = useState<string>(
        sponsor ? (sponsor.pais?.codigo ?? GLOBAL_OPTION) : scopeCountry.code,
    );

    // Si la página no pasó la lista de países, ofrecer al menos el país del scope
    const countryOptions: CountryOption[] =
        countries.length > 0
            ? countries.map((c) => ({ code: c.code, name: c.name }))
            : [{ code: scopeCountry.code, name: scopeCountry.name }];

    const labels = sponsor
        ? { success: 'Sponsor actualizado', error: 'Error al actualizar sponsor', submit: 'Actualizar' }
        : { success: 'Sponsor creado', error: 'Error al crear sponsor', submit: 'Crear Sponsor' };
    const [previewUrl, setPreviewUrl] = useState<string | null>(sponsor?.imagenUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [charCount, setCharCount] = useState(sponsor?.descripcion?.length || 0);

    function handleFileAccepted(file: File): void {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const finalImagenUrl = await resolveImagenUrl(selectedFile, sponsor?.imagenUrl);

            const data = {
                nombre: formData.get('nombre') as string,
                imagenUrl: finalImagenUrl,
                linkExterno: formData.get('linkExterno') as string,
                descripcion: formData.get('descripcion') as string,
                nivel: selectedLevel as CategoriaSponsor,
                fechaInicio: new Date(formData.get('fechaInicio') as string),
                fechaFin: new Date(formData.get('fechaFin') as string),
                activo: sponsor?.activo ?? true,
                countryCode: selectedCountry || null,
            };

            const result = sponsor
                ? await actualizarSponsor({ ...data, id: sponsor.id })
                : await crearSponsor(data);

            if (result.error) {
                setError(result.error);
                notify.error({ title: labels.error, description: result.error });
            } else {
                notify.success({
                    title: labels.success,
                    description: buildPublicationDescription(selectedCountry, countryOptions),
                });
                onSuccess();
            }
            // biome-ignore lint/suspicious/noExplicitAny: Error genérico
        } catch (err: any) {
            const message = err.message || 'Error al procesar la solicitud';
            setError(message);
            notify.error({ title: 'Error', description: message });
        } finally {
            setLoading(false);
        }
    }

    const formatDateForInput = (date: Date | null) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 transition-colors duration-300">
            {sponsor && <input type="hidden" name="id" value={sponsor.id} />}

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
                label="País de publicación"
                hint="Global = visible en todos los países"
            >
                <Select
                    icon="globe"
                    name="countryCode"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                >
                    <option value={GLOBAL_OPTION}>Global (todos los países)</option>
                    {countryOptions.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.name}
                        </option>
                    ))}
                </Select>
            </Field>

            <Field label="Nombre del Sponsor">
                <Input type="text" name="nombre" defaultValue={sponsor?.nombre} required />
            </Field>

            <Field label="Logo / Imagen">
                <div className="flex flex-col gap-4">
                    {previewUrl && (
                        <div className="relative w-fit">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={128}
                                height={128}
                                className="h-32 w-auto rounded-xl border border-line object-contain p-2"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                                className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <ImageDropzone
                        maxSizeMB={3}
                        onFilesAccepted={(files) => {
                            if (files[0]) handleFileAccepted(files[0]);
                        }}
                        required={!sponsor?.imagenUrl}
                        label="Arrastra el logo o haz clic para seleccionar"
                        description="JPG, PNG, WEBP · Máx. 3 MB"
                    />
                </div>
            </Field>

            <Field label="Link Externo (Sitio Web)">
                <Input
                    type="url"
                    name="linkExterno"
                    defaultValue={sponsor?.linkExterno}
                    required
                    placeholder="https://ejemplo.com"
                />
            </Field>

            <Field label="Descripción" optional hint="Máx 170 caracteres.">
                <textarea
                    name="descripcion"
                    defaultValue={sponsor?.descripcion || ''}
                    rows={3}
                    maxLength={170}
                    placeholder="Breve descripción del sponsor..."
                    className="w-full rounded-lg border bg-bg px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted focus:border-ink border-line text-ink"
                    onChange={(e) => setCharCount(e.target.value.length)}
                />
                <div className="mt-1 text-right">
                    <span className="text-[10px] font-medium text-muted">{charCount}/170</span>
                </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha Inicio">
                    <Input
                        type="date"
                        name="fechaInicio"
                        defaultValue={formatDateForInput(sponsor?.fechaInicio || new Date())}
                        required
                    />
                </Field>

                <Field label="Fecha Fin">
                    <Input
                        type="date"
                        name="fechaFin"
                        defaultValue={formatDateForInput(sponsor?.fechaFin || null)}
                        required
                    />
                </Field>
            </div>

            <Field label="Nivel de Sponsor">
                <Select
                    name="nivel"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as CategoriaSponsor)}
                >
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="SENIOR">Senior</option>
                </Select>
            </Field>

            <div className="mt-8 flex justify-end gap-3">
                <Btn type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Btn>
                <Btn type="submit" variant="accent" disabled={loading}>
                    {loading ? 'Guardando...' : labels.submit}
                </Btn>
            </div>
        </form>
    );
}
