import { useState } from 'react';

interface UseImageUploadReturn {
    file: File | null;
    preview: string;
    error: string;
    handleFile: (file: File) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetImage: () => void;
    uploadImage: (file: File) => Promise<string>;
}

export function useImageUpload(initialPreview = ''): UseImageUploadReturn {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>(initialPreview);
    const [error, setError] = useState('');

    const handleFile = (selectedFile: File): void => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Tipo de archivo no válido. Solo JPG, PNG y WEBP');
            return;
        }

        const MAX_SIZE = 3 * 1024 * 1024; // 3MB
        if (selectedFile.size > MAX_SIZE) {
            setError('La imagen no puede superar 3MB');
            return;
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setError('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) handleFile(selectedFile);
    };

    const resetImage = () => {
        setFile(null);
        setPreview('');
        setError('');
    };

    const uploadImage = async (fileToUpload: File): Promise<string> => {
        const formData = new FormData();
        formData.append('files', fileToUpload);
        formData.append('folder', 'services');

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
    };

    return {
        file,
        preview,
        error,
        handleFile,
        handleFileChange,
        resetImage,
        uploadImage,
    };
}
