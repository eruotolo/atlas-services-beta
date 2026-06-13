'use client';

import { type ReactElement, useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';

import { Btn } from '@/shared/components/hireeo';
import Modal from '@/shared/components/admin/Modal';

interface ImageCropperModalProps {
    open: boolean;
    imageSrc: string;
    onConfirm: (blob: Blob) => void;
    onCancel: () => void;
}

const OUTPUT_SIZE = 600;

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (result) => (result ? resolve(result) : reject(new Error('toBlob failed'))),
            'image/webp',
            0.92
        );
    });
}

export function ImageCropperModal({
    open,
    imageSrc,
    onConfirm,
    onCancel,
}: ImageCropperModalProps): ReactElement {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const onCropComplete = useCallback((_area: Area, pixels: Area): void => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = useCallback(async (): Promise<void> => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onConfirm(blob);
        } finally {
            setIsProcessing(false);
        }
    }, [croppedAreaPixels, imageSrc, onConfirm]);

    return (
        <Modal isOpen={open} onClose={onCancel} title="Ajustar foto de perfil">
            {/* Área de recorte */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-black">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>

            {/* Slider de zoom */}
            <div className="mt-6 flex flex-col gap-2">
                <label
                    htmlFor="crop-zoom"
                    className="text-xs font-bold uppercase tracking-wider text-muted"
                >
                    Zoom
                </label>
                <input
                    id="crop-zoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-brand"
                />
            </div>

            {/* Acciones */}
            <div className="mt-8 flex justify-end gap-3">
                <Btn type="button" variant="secondary" onClick={onCancel} disabled={isProcessing}>
                    Cancelar
                </Btn>
                <Btn
                    type="button"
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={isProcessing || !croppedAreaPixels}
                >
                    {isProcessing ? 'Procesando...' : 'Confirmar'}
                </Btn>
            </div>
        </Modal>
    );
}
