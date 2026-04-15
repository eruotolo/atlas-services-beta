'use client';

import { useId, useState } from 'react';

import Image from 'next/image';

import { Upload, X } from 'lucide-react';

import type { CategoriaSponsor } from '../../types/sponsorTypes';

import { actualizarSponsor, crearSponsor } from '@/features/sponsors/actions';

import type { Sponsor } from '../../types/sponsorTypes';

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

    const nombreId = useId();
    const logoId = useId();
    const linkId = useId();
    const descId = useId();
    const inicioId = useId();
    const finId = useId();
    const nivelId = useId();

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
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor={nombreId}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Nombre del Sponsor
                </label>
                <input
                    type="text"
                    id={nombreId}
                    name="nombre"
                    defaultValue={sponsor?.nombre}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div>
                <label
                    htmlFor={logoId}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Logo / Imagen
                </label>
                <div className="flex flex-col gap-4">
                    {previewUrl && (
                        <div className="relative w-fit">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={128}
                                height={128}
                                className="h-32 w-auto rounded-xl border border-gray-200 object-contain p-2 dark:border-white/10 dark:bg-gray-800"
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
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 hover:bg-gray-100 dark:border-white/10 dark:bg-gray-900/40 dark:hover:bg-gray-800">
                        <Upload className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            Clic para subir imagen (JPG, PNG)
                        </span>
                        <input
                            type="file"
                            id={logoId}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            required={!sponsor?.imagenUrl}
                        />
                    </label>
                </div>
            </div>

            <div>
                <label
                    htmlFor={linkId}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Link Externo (Sitio Web)
                </label>
                <input
                    type="url"
                    id={linkId}
                    name="linkExterno"
                    defaultValue={sponsor?.linkExterno}
                    required
                    placeholder="https://ejemplo.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div>
                <div className="mb-1.5 flex items-center justify-between">
                    <label
                        htmlFor={descId}
                        className="text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                    >
                        Descripción (opcional)
                    </label>
                    <span className="text-[10px] font-bold text-gray-400">Máx 170 caracteres.</span>
                </div>
                <textarea
                    id={descId}
                    name="descripcion"
                    defaultValue={sponsor?.descripcion || ''}
                    rows={3}
                    maxLength={170}
                    placeholder="Breve descripción del sponsor..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                    onChange={(e) => setCharCount(e.target.value.length)}
                />
                <div className="mt-1 text-right">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600">
                        {charCount}/170
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor={inicioId}
                        className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                    >
                        Fecha Inicio
                    </label>
                    <input
                        type="date"
                        id={inicioId}
                        name="fechaInicio"
                        defaultValue={formatDateForInput(sponsor?.fechaInicio || new Date())}
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                <div>
                    <label
                        htmlFor={finId}
                        className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                    >
                        Fecha Fin
                    </label>
                    <input
                        type="date"
                        id={finId}
                        name="fechaFin"
                        defaultValue={formatDateForInput(sponsor?.fechaFin || null)}
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor={nivelId}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Nivel de Sponsor
                </label>
                <select
                    id={nivelId}
                    name="nivel"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as CategoriaSponsor)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                >
                    <option value="STANDARD" className="dark:bg-gray-900">
                        Standard
                    </option>
                    <option value="PREMIUM" className="dark:bg-gray-900">
                        Premium
                    </option>
                    <option value="SENIOR" className="dark:bg-gray-900">
                        Senior
                    </option>
                </select>
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
                    {loading ? 'Guardando...' : sponsor ? 'Actualizar' : 'Crear Sponsor'}
                </button>
            </div>
        </form>
    );
}
