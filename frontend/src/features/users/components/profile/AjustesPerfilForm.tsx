'use client';

import { useRef, useState } from 'react';

import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Camera, Key, Loader2, Save, User } from 'lucide-react';

import { actualizarPassword, actualizarPerfil } from '@/features/users/actions';
import { useCountryLink } from '@/features/geo/hooks/useCountryLink';

interface AjustesPerfilFormProps {
    usuario: {
        id: string;
        nombre: string;
        email: string;
        telefono: string | null;
        avatar: string | null;
    };
}

export default function AjustesPerfilForm({ usuario }: AjustesPerfilFormProps) {
    const router = useRouter();
    const link = useCountryLink();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States for Profile Info
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [infoError, setInfoError] = useState('');
    const [infoSuccess, setInfoSuccess] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(usuario.avatar);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // States for Password
    const [loadingPass, setLoadingPass] = useState(false);
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño
        if (file.size > 2 * 1024 * 1024) {
            setInfoError('La imagen no puede pesar más de 2MB');
            return;
        }

        // Procesar imagen para recorte cuadrado 500x500
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 500;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Calcular dimensiones para el recorte central (square crop)
            let sx;
            let sy;
            let sWidth;
            let sHeight;
            if (img.width > img.height) {
                sHeight = img.height;
                sWidth = img.height;
                sx = (img.width - img.height) / 2;
                sy = 0;
            } else {
                sWidth = img.width;
                sHeight = img.width;
                sx = 0;
                sy = (img.height - img.width) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

            canvas.toBlob((blob) => {
                if (blob) {
                    const processedFile = new File([blob], 'avatar.png', { type: 'image/png' });
                    setSelectedFile(processedFile);
                    setPreviewUrl(URL.createObjectURL(blob));
                }
            }, 'image/png');
        };
    };

    async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
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
                setInfoSuccess('Perfil actualizado correctamente');
                router.refresh();
            }
        } catch (_err) {
            setInfoError('Error al procesar la solicitud');
        } finally {
            setLoadingInfo(false);
        }
    }

    async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
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
                setPassSuccess('Contraseña actualizada correctamente');
                e.currentTarget.reset();
            }
        } catch (_err) {
            setPassError('Error al procesar la solicitud');
        } finally {
            setLoadingPass(false);
        }
    }

    return (
        <div className="animate-in fade-in space-y-8 transition-colors duration-300 duration-500">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <Link
                        href={link('/perfil')}
                        className="rounded-xl border border-gray-100 bg-white p-2.5 text-gray-400 shadow-sm transition-all hover:border-blue-100 hover:text-blue-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-500 dark:hover:text-blue-400"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl dark:text-white">
                            Ajustes de Perfil
                        </h1>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Gestiona tu información personal y seguridad
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Info Personal & Avatar */}
                <div className="space-y-6 lg:col-span-8">
                    <form
                        onSubmit={handleUpdateProfile}
                        className="space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-10 dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl"
                    >
                        <input type="hidden" name="userId" value={usuario.id} />
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6 dark:border-white/5">
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <User size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                Información General
                            </h2>
                        </div>

                        {infoError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                                {infoError}
                            </div>
                        )}
                        {infoSuccess && (
                            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-600 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
                                {infoSuccess}
                            </div>
                        )}

                        <div className="flex flex-col items-start gap-10 md:flex-row">
                            {/* Avatar Upload */}
                            <div className="mx-auto flex flex-col items-center gap-4 md:mx-0">
                                <div className="group relative">
                                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-gray-50 shadow-2xl dark:border-gray-900 dark:bg-gray-800">
                                        {previewUrl ? (
                                            <div className="relative h-full w-full">
                                                <NextImage
                                                    src={previewUrl}
                                                    alt="Avatar"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-4xl font-black text-gray-200 dark:text-gray-700">
                                                {usuario.nombre.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -right-1 -bottom-1 cursor-pointer rounded-xl bg-blue-600 p-3 text-white shadow-xl transition-all group-hover:scale-110 hover:bg-blue-700 active:scale-95 dark:shadow-none"
                                    >
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="text-center">
                                    <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase dark:text-gray-500">
                                        PNG, JPG Max 2MB
                                    </p>
                                </div>
                            </div>

                            <div className="grid w-full flex-grow grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <span className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                                        Nombre Completo
                                    </span>
                                    <input
                                        type="text"
                                        name="nombre"
                                        defaultValue={usuario.nombre}
                                        required
                                        className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <span className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                                        Email (Privado)
                                    </span>
                                    <input
                                        type="email"
                                        value={usuario.email}
                                        disabled
                                        className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-400 outline-none dark:border-white/5 dark:bg-gray-900 dark:text-gray-600"
                                    />
                                </div>
                                <div>
                                    <span className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                                        Teléfono
                                    </span>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        defaultValue={usuario.telefono || ''}
                                        placeholder="+56 9 ..."
                                        className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-gray-50 pt-6 dark:border-white/5">
                            <button
                                type="submit"
                                disabled={loadingInfo}
                                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 md:w-auto dark:shadow-none"
                            >
                                {loadingInfo ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Save size={18} />
                                )}
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Change */}
                <div className="space-y-6 lg:col-span-4">
                    <form
                        onSubmit={handleUpdatePassword}
                        className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6 dark:border-white/5">
                            <div className="rounded-lg bg-gray-50 p-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                                <Key size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                Seguridad
                            </h2>
                        </div>

                        {passError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                                {passError}
                            </div>
                        )}
                        {passSuccess && (
                            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-600 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
                                {passSuccess}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <span className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                                    Contraseña Actual
                                </span>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
                                />
                            </div>
                            <div className="border-t border-gray-50 pt-2 dark:border-white/5">
                                <span className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                                    Nueva Contraseña
                                </span>
                                <input
                                    type="password"
                                    name="newPassword"
                                    required
                                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
                                />
                            </div>
                            <div>
                                <span className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                                    Confirmar Nueva
                                </span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loadingPass}
                                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:bg-black active:scale-95 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                            >
                                {loadingPass ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Key size={18} />
                                )}
                                Cambiar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
