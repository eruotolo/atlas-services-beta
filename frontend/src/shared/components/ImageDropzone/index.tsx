'use client';

import { type ReactElement, useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';

export interface ImageDropzoneProps {
    onFilesAccepted: (files: File[]) => void;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeMB?: number;
    disabled?: boolean;
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    className?: string;
}

// Icon source: MCP icons0 — lucide:cloud-upload (ISC license)
function UploadIcon(): ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            >
                <path d="M12 13v8m-8-6.101A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="m8 17l4-4l4 4" />
            </g>
        </svg>
    );
}

function toRejectionMessage(rejections: FileRejection[], maxSizeMB: number): string {
    for (const { errors } of rejections) {
        for (const err of errors) {
            if (err.code === 'file-too-large') return `El archivo supera ${maxSizeMB} MB`;
            if (err.code === 'file-invalid-type')
                return 'Tipo de archivo no válido. Solo JPG, PNG y WEBP';
            if (err.code === 'too-many-files')
                return 'Has superado el límite de imágenes permitidas';
        }
    }
    return 'Archivo no válido';
}

export function ImageDropzone({
    onFilesAccepted,
    multiple = false,
    maxFiles,
    maxSizeMB = 3,
    disabled = false,
    label = 'Arrastra una imagen aquí o haz clic para seleccionar',
    description = 'JPG, PNG, WEBP',
    error: externalError,
    required,
    className,
}: ImageDropzoneProps): ReactElement {
    const [internalError, setInternalError] = useState('');

    const onDrop = useCallback(
        (accepted: File[], rejections: FileRejection[]) => {
            if (rejections.length > 0) {
                setInternalError(toRejectionMessage(rejections, maxSizeMB));
                return;
            }
            setInternalError('');
            if (accepted.length > 0) onFilesAccepted(accepted);
        },
        [onFilesAccepted, maxSizeMB],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        },
        maxSize: maxSizeMB * 1024 * 1024,
        multiple,
        maxFiles: multiple && maxFiles ? maxFiles : undefined,
        disabled,
    });

    const errorMessage = externalError ?? internalError;

    return (
        <div>
            <div
                {...getRootProps()}
                className={[
                    'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
                    isDragActive ? 'border-ink bg-tint/70' : 'border-line bg-tint hover:bg-tint/70',
                    disabled ? 'cursor-not-allowed opacity-50' : '',
                    className ?? '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <input {...getInputProps({ required })} />
                <span className="text-muted">
                    <UploadIcon />
                </span>
                <span className="text-[12px] font-medium text-sub">{label}</span>
                {description ? (
                    <span className="text-[11px] text-muted">{description}</span>
                ) : null}
            </div>
            {errorMessage ? (
                <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            ) : null}
        </div>
    );
}
