'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Upload, X } from 'lucide-react';

import { actualizarSponsor, crearSponsor } from '@/features/sponsors/actions';
import { Btn, Field, Input, Select } from '@/shared/components/hireeo';

import type { CategoriaSponsor, Sponsor } from '../../types/sponsorTypes';

interface SponsorFormProps {
    sponsor?: Sponsor;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SponsorForm({ sponsor, onSuccess, onCancel }: SponsorFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(sponsor?.nivel || 'STANDARD');
    const [previewUrl, setPreviewUrl] = useState<string | null>(sponsor?.imagenUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [charCount, setCharCount] = useState(sponsor?.descripcion?.length || 0);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const MAX_SIZE = 3 * 1024 * 1024; // 3MB
            if (file.size > MAX_SIZE) {
                setError(`El archivo ${file.name} supera el tamaño máximo de 3MB`);
                e.target.value = '';
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            let finalImagenUrl = sponsor?.imagenUrl || '';

            if (selectedFile) {
                finalImagenUrl = await uploadImage(selectedFile);
            } else if (!sponsor?.imagenUrl) {
                throw new Error('Debes subir una imagen');
            }

            const data = {
                nombre: formData.get('nombre') as string,
                imagenUrl: finalImagenUrl,
                linkExterno: formData.get('linkExterno') as string,
                descripcion: formData.get('descripcion') as string,
                nivel: selectedLevel as CategoriaSponsor,
                fechaInicio: new Date(formData.get('fechaInicio') as string),
                fechaFin: new Date(formData.get('fechaFin') as string),
                activo: sponsor ? sponsor.activo : true,
            };

            const result = sponsor
                ? await actualizarSponsor({ ...data, id: sponsor.id })
                : await crearSponsor(data);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
            // biome-ignore lint/suspicious/noExplicitAny: Error genérico
        } catch (err: any) {
            setError(err.message || 'Error al procesar la solicitud');
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
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-tint px-4 py-8 transition-colors hover:bg-tint/70">
                        <Upload className="text-muted" />
                        <span className="text-xs font-bold text-sub">
                            Clic para subir imagen (JPG, PNG)
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            required={!sponsor?.imagenUrl}
                        />
                    </label>
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
                    className="w-full rounded-lg border bg-bg px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted focus:border-ink"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    onChange={(e) => setCharCount(e.target.value.length)}
                />
                <div className="mt-1 text-right">
                    <span className="text-[10px] font-bold text-muted">{charCount}/170</span>
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

            <div className="flex justify-end gap-3 border-t border-line pt-4">
                <Btn type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Btn>
                <Btn type="submit" variant="accent" disabled={loading}>
                    {loading ? 'Guardando...' : sponsor ? 'Actualizar' : 'Crear Sponsor'}
                </Btn>
            </div>
        </form>
    );
}
