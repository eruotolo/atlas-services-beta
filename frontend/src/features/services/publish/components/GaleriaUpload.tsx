'use client';

import { useId, useState } from 'react';

import Image from 'next/image';

import { Image as ImageIcon, X } from 'lucide-react';

interface ImageData {
    id: string;
    file: File;
    preview: string;
}

interface GaleriaUploadProps {
    maxImages: number;
    maxSizeMB: number;
    onImagesChange: (files: File[]) => void;
    label: string;
    description?: string;
}

export default function GaleriaUpload({
    maxImages,
    maxSizeMB,
    onImagesChange,
    label,
    description,
}: GaleriaUploadProps) {
    const inputId = useId();
    const [imagenes, setImagenes] = useState<ImageData[]>([]);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        // Validar tipo y peso
        for (const file of files) {
            if (!validImageTypes.includes(file.type)) {
                setError(`${file.name} no es un tipo válido`);
                return;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                setError(`${file.name} supera ${maxSizeMB}MB`);
                return;
            }
        }

        // No exceder maxImages
        const filesToAdd = files.slice(0, maxImages - imagenes.length);

        // Generar previews para los nuevos archivos
        const newImageData: ImageData[] = [];
        let loadedCount = 0;

        filesToAdd.forEach((file) => {
            const id = crypto.randomUUID();
            const reader = new FileReader();
            reader.onloadend = () => {
                newImageData.push({
                    id,
                    file,
                    preview: reader.result as string,
                });
                loadedCount++;
                if (loadedCount === filesToAdd.length) {
                    const updatedImagenes = [...imagenes, ...newImageData];
                    setImagenes(updatedImagenes);
                    onImagesChange(updatedImagenes.map((img) => img.file));
                }
            };
            reader.readAsDataURL(file);
        });

        setError('');
    };

    const handleRemove = (id: string) => {
        const newImagenes = imagenes.filter((img) => img.id !== id);
        setImagenes(newImagenes);
        onImagesChange(newImagenes.map((img) => img.file));
    };

    return (
        <div>
            <label
                htmlFor={inputId}
                className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
            >
                {label}
            </label>
            <div className="space-y-4">
                <div className="relative">
                    <ImageIcon
                        size={18}
                        className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                    />
                    <input
                        type="file"
                        id={inputId}
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        disabled={imagenes.length >= maxImages}
                        className="form-input pr-4 pl-12 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                    />
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                        <span>{error}</span>
                    </div>
                )}

                {imagenes.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {imagenes.map((imagen, idx) => (
                            <div key={imagen.id} className="group relative">
                                <Image
                                    src={imagen.preview}
                                    alt={`Preview ${idx + 1}`}
                                    width={300}
                                    height={128}
                                    className="h-32 w-full rounded-xl border border-gray-200 object-cover dark:border-white/10"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemove(imagen.id)}
                                    className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                    aria-label={`Eliminar imagen ${idx + 1}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-500">
                    {imagenes.length}/{maxImages} imágenes | Máximo {maxSizeMB}MB cada una
                    {description && ` | ${description}`}
                </p>
            </div>
        </div>
    );
}
