'use client';

import { useState, type FormEvent, type ReactElement } from 'react';

import NextImage from 'next/image';
import { useRouter } from 'next/navigation';

import { actualizarPassword, actualizarPerfil } from '@/features/users/actions';
import { Btn, Card, Field, Icon, Input, Mono } from '@/shared/components/hireeo';
import { ImageDropzone } from '@/shared/components/ImageDropzone';

interface AjustesPerfilFormProps {
    usuario: {
        id: string;
        nombre: string;
        email: string;
        telefono: string | null;
        avatar: string | null;
    };
}

const AVATAR_SIZE = 500;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function cropToSquare(img: HTMLImageElement): Promise<File | null> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

        canvas.toBlob((blob) => {
            resolve(blob ? new File([blob], 'avatar.png', { type: 'image/png' }) : null);
        }, 'image/png');
    });
}

export default function AjustesPerfilForm({ usuario }: AjustesPerfilFormProps): ReactElement {
    const router = useRouter();

    const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
    const [infoError, setInfoError] = useState<string>('');
    const [infoSuccess, setInfoSuccess] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(usuario.avatar);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [loadingPass, setLoadingPass] = useState<boolean>(false);
    const [passError, setPassError] = useState<string>('');
    const [passSuccess, setPassSuccess] = useState<string>('');

    async function handleAvatarDropped(files: File[]): Promise<void> {
        const file = files[0];
        if (!file) return;
        if (file.size > MAX_AVATAR_BYTES) {
            setInfoError('La imagen no puede pesar más de 2 MB.');
            return;
        }
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            const cropped = await cropToSquare(img);
            if (cropped) {
                setSelectedFile(cropped);
                setPreviewUrl(URL.createObjectURL(cropped));
                setInfoError('');
            }
        };
    }

    async function handleUpdateProfile(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setLoadingInfo(true);
        setInfoError('');
        setInfoSuccess('');

        const formData = new FormData(e.currentTarget);
        if (selectedFile) {
            formData.set('avatar', selectedFile);
        }

        try {
            const result = await actualizarPerfil(formData);
            if (result.error) {
                setInfoError(result.error);
            } else {
                setInfoSuccess('Perfil actualizado correctamente.');
                router.refresh();
            }
        } catch {
            setInfoError('Error al procesar la solicitud.');
        } finally {
            setLoadingInfo(false);
        }
    }

    async function handleUpdatePassword(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setLoadingPass(true);
        setPassError('');
        setPassSuccess('');

        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        try {
            const result = await actualizarPassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            if (result.error) {
                setPassError(result.error);
            } else {
                setPassSuccess('Contraseña actualizada correctamente.');
                e.currentTarget.reset();
            }
        } catch {
            setPassError('Error al procesar la solicitud.');
        } finally {
            setLoadingPass(false);
        }
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card padding={28}>
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                    <input type="hidden" name="userId" value={usuario.id} />

                    <header className="flex items-center gap-3">
                        <div
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-tint"
                        >
                            <Icon name="user" size={16} />
                        </div>
                        <div>
                            <h2
                                className="m-0 text-[15px] font-semibold text-ink"
                            >
                                Información general
                            </h2>
                            <Mono className="mt-0.5 text-[10.5px] text-sub">
                                Cómo te ven los clientes.
                            </Mono>
                        </div>
                    </header>

                    {infoError ? (
                        <div
                            className="rounded-md px-3 py-2 text-[12.5px] font-semibold"
                            style={{
                                background: 'var(--danger-soft)',
                                color: 'var(--danger)',
                            }}
                        >
                            {infoError}
                        </div>
                    ) : null}
                    {infoSuccess ? (
                        <div
                            className="rounded-md px-3 py-2 text-[12.5px] font-semibold"
                            style={{
                                background: 'var(--success-soft)',
                                color: 'var(--success)',
                            }}
                        >
                            {infoSuccess}
                        </div>
                    ) : null}

                    <div className="flex flex-col items-start gap-6 md:flex-row">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="relative h-24 w-24 overflow-hidden rounded-xl border bg-tint border-line"
                            >
                                {previewUrl ? (
                                    <NextImage
                                        src={previewUrl}
                                        alt="Avatar"
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div
                                        className="flex h-full w-full items-center justify-center text-3xl font-medium text-muted"
                                    >
                                        {usuario.nombre.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <ImageDropzone
                                maxSizeMB={MAX_AVATAR_BYTES / (1024 * 1024)}
                                onFilesAccepted={handleAvatarDropped}
                                label="Arrastra tu foto o haz clic"
                                description="PNG, JPG · Máx 2 MB"
                            />
                        </div>

                        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Field label="Nombre completo">
                                    <Input
                                        icon="user"
                                        type="text"
                                        name="nombre"
                                        defaultValue={usuario.nombre}
                                        required
                                    />
                                </Field>
                            </div>
                            <Field label="Email" hint="Privado, no visible en tu perfil">
                                <Input
                                    icon="mail"
                                    type="email"
                                    value={usuario.email}
                                    readOnly
                                    disabled
                                />
                            </Field>
                            <Field label="Teléfono / WhatsApp">
                                <Input
                                    icon="phone"
                                    type="tel"
                                    name="telefono"
                                    defaultValue={usuario.telefono ?? ''}
                                    placeholder="+56 9 …"
                                />
                            </Field>
                        </div>
                    </div>

                    <div
                        className="flex justify-end border-t pt-4 border-line"
                    >
                        <Btn
                            type="submit"
                            variant="primary"
                            icon="check"
                            disabled={loadingInfo}
                        >
                            {loadingInfo ? 'Guardando…' : 'Guardar cambios'}
                        </Btn>
                    </div>
                </form>
            </Card>

            <Card padding={28}>
                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
                    <header className="flex items-center gap-3">
                        <div
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-tint"
                        >
                            <Icon name="key" size={16} />
                        </div>
                        <div>
                            <h2
                                className="m-0 text-[15px] font-semibold text-ink"
                            >
                                Seguridad
                            </h2>
                            <Mono className="mt-0.5 text-[10.5px] text-sub">
                                Cambiá tu contraseña.
                            </Mono>
                        </div>
                    </header>

                    {passError ? (
                        <div
                            className="rounded-md px-3 py-2 text-[12.5px] font-semibold"
                            style={{
                                background: 'var(--danger-soft)',
                                color: 'var(--danger)',
                            }}
                        >
                            {passError}
                        </div>
                    ) : null}
                    {passSuccess ? (
                        <div
                            className="rounded-md px-3 py-2 text-[12.5px] font-semibold"
                            style={{
                                background: 'var(--success-soft)',
                                color: 'var(--success)',
                            }}
                        >
                            {passSuccess}
                        </div>
                    ) : null}

                    <Field label="Contraseña actual">
                        <Input icon="key" type="password" name="currentPassword" required />
                    </Field>
                    <Field label="Nueva contraseña" hint="Mín. 8 caracteres">
                        <Input icon="key" type="password" name="newPassword" required />
                    </Field>
                    <Field label="Confirmar nueva">
                        <Input icon="key" type="password" name="confirmPassword" required />
                    </Field>

                    <Btn
                        type="submit"
                        variant="primary"
                        icon="key"
                        disabled={loadingPass}
                        className="w-full justify-center"
                    >
                        {loadingPass ? 'Cambiando…' : 'Cambiar contraseña'}
                    </Btn>
                </form>
            </Card>
        </div>
    );
}
