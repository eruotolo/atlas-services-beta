'use client';

import { type FormEvent, type ReactElement, useCallback, useId, useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { actualizarPerfil } from '@/features/users/actions';
import { Btn } from '@/shared/components/hireeo';
import { ImageCropperModal } from '@/shared/components/admin/ImageCropperModal';
import { ImageDropzone } from '@/shared/components/ImageDropzone';
import { formNotify } from '@/shared/lib/formNotify';

interface AdminProfileFormProps {
    usuario: {
        id: string;
        nombre: string;
        email: string;
        telefono: string | null;
        avatar: string | null;
    };
    onSuccess: () => void;
    onCancel: () => void;
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // Aumentado a 5MB porque react-easy-crop lo procesa y reduce localmente

export function AdminProfileForm({ usuario, onSuccess, onCancel }: AdminProfileFormProps): ReactElement {
    const router = useRouter();
    const { update } = useSession();
    const baseId = useId();

    const [loading, setLoading] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(usuario.avatar);
    const [error, setError] = useState<string>('');

    // Crop state
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

    function handleImageDropped(files: File[]): void {
        const file = files[0];
        if (!file) return;
        if (file.size > MAX_AVATAR_BYTES) {
            setError(`La imagen no puede pesar más de ${MAX_AVATAR_BYTES / (1024 * 1024)} MB.`);
            return;
        }
        setCropSrc(URL.createObjectURL(file));
        setError('');
    }

    const handleCropConfirm = useCallback((blob: Blob): void => {
        setCroppedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setCropSrc(null);
    }, []);

    const handleCropCancel = useCallback((): void => {
        setCropSrc(null);
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const profileData = new FormData();
            profileData.set('userId', usuario.id);
            profileData.set('nombre', formData.get('nombre') as string);
            profileData.set('telefono', formData.get('telefono') as string);
            if (croppedBlob) {
                profileData.set('avatar', croppedBlob, 'avatar.webp');
            }

            const profileResult = await actualizarPerfil(profileData);
            if (profileResult.error) {
                setError(profileResult.error);
                return;
            }

            // Refrescar NextAuth session si hay avatar o cambios de datos
            if (
                profileResult.avatar ||
                profileData.get('nombre') !== usuario.nombre ||
                profileData.get('telefono') !== usuario.telefono
            ) {
                await update({
                    user: {
                        name: profileData.get('nombre') as string,
                        image: profileResult.avatar ?? usuario.avatar ?? null,
                        phone: profileData.get('telefono') as string,
                    },
                });
            }

            formNotify.updated('Perfil');
            router.refresh();
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar los cambios.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative flex h-[180px] w-[180px] shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-line/30 bg-tint">
                        {previewUrl ? (
                            <NextImage
                                src={previewUrl}
                                alt="Avatar"
                                fill
                                sizes="180px"
                                className="object-cover rounded-full"
                                unoptimized={previewUrl.startsWith('blob:')}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-muted">
                                {usuario.nombre.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <ImageDropzone
                        maxSizeMB={MAX_AVATAR_BYTES / (1024 * 1024)}
                        onFilesAccepted={handleImageDropped}
                        label="Arrastra tu foto o haz clic para seleccionar"
                        description="JPG, PNG, WEBP · Máx. 5 MB"
                    />
                </div>

                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <label htmlFor={`${baseId}-nombre`} className="mb-1.5 block text-[12px] font-semibold text-ink">
                            Nombre completo
                        </label>
                        <input
                            id={`${baseId}-nombre`}
                            type="text"
                            name="nombre"
                            defaultValue={usuario.nombre}
                            required
                            className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor={`${baseId}-email`} className="mb-1.5 block text-[12px] font-semibold text-ink">
                                Email (Solo lectura)
                            </label>
                            <input
                                id={`${baseId}-email`}
                                type="email"
                                value={usuario.email}
                                disabled
                                className="w-full cursor-not-allowed rounded-xl border border-line bg-tint/50 px-4 py-2.5 text-sm text-sub outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor={`${baseId}-telefono`} className="mb-1.5 block text-[12px] font-semibold text-ink">
                                Teléfono / WhatsApp
                            </label>
                            <input
                                id={`${baseId}-telefono`}
                                type="tel"
                                name="telefono"
                                defaultValue={usuario.telefono ?? ''}
                                placeholder="+56 9 ..."
                                className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <Btn type="button" variant="secondary" disabled={loading} onClick={onCancel}>
                    Cancelar
                </Btn>
                <Btn type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Btn>
            </div>

            {cropSrc && (
                <ImageCropperModal
                    open={!!cropSrc}
                    imageSrc={cropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
        </form>
    );
}
