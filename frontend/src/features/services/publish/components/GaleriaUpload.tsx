'use client';

import { useState } from 'react';

import Image from 'next/image';

import { X } from '@/shared/components/icons';
import { ImageDropzone } from '@/shared/components/ImageDropzone';

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
    const [imagenes, setImagenes] = useState<ImageData[]>([]);
    const [error, setError] = useState<string>('');

    const handleFilesAccepted = (files: File[]): void => {
        const remaining = maxImages - imagenes.length;
        if (remaining <= 0) return;

        const filesToAdd = files.slice(0, remaining);
        const newImageData: ImageData[] = [];
        let loadedCount = 0;

        filesToAdd.forEach((file) => {
            const id = crypto.randomUUID();
            const reader = new FileReader();
            reader.onloadend = () => {
                newImageData.push({ id, file, preview: reader.result as string });
                loadedCount++;
                if (loadedCount === filesToAdd.length) {
                    const updatedImagenes = [...imagenes, ...newImageData];
                    setImagenes(updatedImagenes);
                    onImagesChange(updatedImagenes.map((img) => img.file));
                    setError('');
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemove = (id: string): void => {
        const newImagenes = imagenes.filter((img) => img.id !== id);
        setImagenes(newImagenes);
        onImagesChange(newImagenes.map((img) => img.file));
    };

    return (
        <div>
            <p className="mb-2 text-sm font-bold text-sub">{label}</p>
            <div className="space-y-4">
                <ImageDropzone
                    multiple
                    maxSizeMB={maxSizeMB}
                    disabled={imagenes.length >= maxImages}
                    onFilesAccepted={handleFilesAccepted}
                    error={error}
                    label="Arrastra imágenes o haz clic para seleccionar"
                    description={
                        description ??
                        `JPG, PNG, WEBP · Máx. ${maxSizeMB} MB por imagen`
                    }
                />

                {imagenes.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {imagenes.map((imagen, idx) => (
                            <div key={imagen.id} className="group relative">
                                <Image
                                    src={imagen.preview}
                                    alt={`Preview ${idx + 1}`}
                                    width={300}
                                    height={128}
                                    className="h-32 w-full rounded-xl border border-line object-cover"
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

                <p className="text-xs text-muted">
                    {imagenes.length}/{maxImages} imágenes | Máximo {maxSizeMB}MB cada una
                    {description && ` | ${description}`}
                </p>
            </div>
        </div>
    );
}
