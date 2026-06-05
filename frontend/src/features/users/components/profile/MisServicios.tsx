'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
    AlertCircle,
    Crown,
    Edit2,
    Eye,
    EyeOff,
    Plus,
    ShieldCheck,
    Trash2,
    Zap,
} from 'lucide-react';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';

import { eliminarServicioPropio, toggleActivoServicioPropio } from '@/features/users/actions';

import Modal from '@/shared/components/admin/Modal';

import UserServicioForm from './UserServicioForm';

interface RedSocial {
    tipo:
        | 'WEBSITE'
        | 'FACEBOOK'
        | 'INSTAGRAM'
        | 'LINKEDIN'
        | 'TIKTOK'
        | 'TWITTER'
        | 'YOUTUBE'
        | 'OTRO';
    url: string;
}

interface Servicio {
    id: string;
    titulo: string;
    categoria: string;
    categoriaId: string;
    categories?: Array<{
        id: string;
        nombre: string;
    }>;
    descripcion: string;
    precio: number;
    comuna: string;
    imagenPrincipal: string | null;
    imagenes: string[];
    nombreContacto: string | null;
    emailContacto: string | null;
    telefonoContacto: string | null;
    redesSociales?: RedSocial[];
    activo: boolean;
    destacado: boolean;
    nivel: 'BASICO' | 'PREMIUM';
    fechaInicio: Date;
    fechaFin: Date;
    suscripcion: {
        id: string;
        duracionMeses: number;
        monto: number;
        fechaFin: Date;
    } | null;
}

interface Categoria {
    id: string;
    nombre: string;
}

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono?: string | null;
}

interface MisServiciosProps {
    servicios: Servicio[];
    categorias: Categoria[];
    usuario: Usuario;
}

export default function MisServicios({ servicios, categorias, usuario }: MisServiciosProps) {
    const router = useRouter();
    const link = useCountryLink();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    function handleEdit(servicio: Servicio) {
        setSelectedServicio(servicio);
        setIsEditModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (
            !confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')
        ) {
            return;
        }

        setIsDeleting(id);
        try {
            const result = await eliminarServicioPropio(id);
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
            }
        } catch (_error) {
            alert('Error al eliminar servicio');
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(id: string) {
        try {
            const result = await toggleActivoServicioPropio(id);
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
            }
        } catch (_error) {
            alert('Error al cambiar estado del servicio');
        }
    }

    function handleSuccess() {
        setIsEditModalOpen(false);
        setSelectedServicio(null);
        router.refresh();
    }

    function formatearFecha(fecha: Date): string {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="rounded-[2.5rem] border border-line bg-bg p-8 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h3 className="text-2xl font-black text-ink italic">
                            Mis Servicios Publicados
                        </h3>
                        <p className="text-sm text-muted">
                            Gestiona la visibilidad y el estado de cada uno de tus anuncios.
                        </p>
                    </div>
                    <Link
                        href={link('/publicar')}
                        className="btn-primary flex items-center justify-center gap-2 rounded-2xl px-8 py-3"
                    >
                        <Plus size={18} /> Publicar Nuevo
                    </Link>
                </div>
            </div>

            {/* Lista de Servicios */}
            {servicios.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Lista de servicios compleja */}
                    {servicios.map((servicio) => (
                        <div
                            key={servicio.id}
                            className="relative overflow-hidden rounded-3xl border border-line bg-bg p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            {servicio.destacado && (
                                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand" />
                            )}

                            <div className="flex flex-col gap-6 md:flex-row">
                                <div className="flex-grow space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-[10px] font-black tracking-widest text-brand uppercase">
                                            {servicio.categories && servicio.categories.length > 0
                                                ? servicio.categories
                                                      .map((c) => c.nombre)
                                                      .join(', ')
                                                : servicio.categoria}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {servicio.nivel === 'PREMIUM' ? (
                                                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[9px] font-black text-amber-600 uppercase">
                                                    <Crown size={10} /> Premium
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-tint px-3 py-1 text-[9px] font-black text-muted uppercase">
                                                    Básico
                                                </span>
                                            )}
                                            {servicio.destacado && (
                                                <span className="rounded-full bg-brand px-3 py-1 text-[9px] font-black text-white uppercase">
                                                    Destacado
                                                </span>
                                            )}
                                            <span
                                                className={`rounded-full px-3 py-1 text-[9px] font-black uppercase ${
                                                    servicio.activo
                                                        ? 'bg-green-50 text-green-600'
                                                        : 'bg-tint text-muted'
                                                }`}
                                            >
                                                {servicio.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="line-clamp-1 text-xl font-bold text-ink">
                                        {servicio.titulo}
                                    </h4>
                                    <p className="line-clamp-2 text-sm text-muted">
                                        {servicio.descripcion}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 pt-2">
                                        <div className="flex items-center gap-1 text-xs text-muted">
                                            <ShieldCheck size={14} className="text-green-500" />
                                            <span>{servicio.comuna}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-bold text-ink">
                                            <span>${servicio.precio.toLocaleString('es-CL')}</span>
                                        </div>
                                    </div>

                                    {servicio.nivel === 'PREMIUM' && servicio.suscripcion && (
                                        <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 pt-2 text-xs text-amber-600">
                                            <span className="font-bold">
                                                Premium hasta: {formatearFecha(servicio.fechaFin)}
                                            </span>
                                            <span className="ml-2 text-amber-500">
                                                ({servicio.suscripcion.duracionMeses}{' '}
                                                {servicio.suscripcion.duracionMeses === 1
                                                    ? 'mes'
                                                    : 'meses'}
                                                )
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex shrink-0 flex-col justify-center gap-2 md:min-w-[200px]">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActivo(servicio.id)}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line py-2.5 text-xs font-bold text-sub transition-all hover:bg-tint"
                                    >
                                        {servicio.activo ? (
                                            <>
                                                <EyeOff size={14} /> Desactivar
                                            </>
                                        ) : (
                                            <>
                                                <Eye size={14} /> Activar
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(servicio)}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-brand/20 py-2.5 text-xs font-bold text-brand transition-all hover:bg-brand/5"
                                    >
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(servicio.id)}
                                        disabled={isDeleting === servicio.id}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-red-100 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                    {servicio.nivel === 'BASICO' && (
                                        <Link
                                            href={link(`/publicar?upgrade=${servicio.id}`)}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 py-2.5 text-xs font-black text-amber-700 transition-all hover:bg-amber-100"
                                        >
                                            <Crown size={14} /> Actualizar a Premium
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-[2.5rem] border-2 border-dashed border-line bg-bg p-16 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-tint text-muted">
                        <AlertCircle size={40} />
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-ink">
                        Aún no tienes servicios activos
                    </h4>
                    <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-muted">
                        Publica tu oficio hoy mismo y empieza a recibir llamados de clientes en tu
                        zona.
                    </p>
                    <Link
                        href={link('/publicar')}
                        className="btn-primary inline-flex items-center gap-2 rounded-2xl px-10 py-4"
                    >
                        <Zap size={20} /> Crear mi primer aviso
                    </Link>
                </div>
            )}

            {/* Modal Editar */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedServicio(null);
                }}
                title="Editar Servicio"
            >
                {selectedServicio && (
                    <UserServicioForm
                        servicio={{
                            id: selectedServicio.id,
                            titulo: selectedServicio.titulo,
                            categoria: selectedServicio.categoriaId,
                            descripcion: selectedServicio.descripcion,
                            precio: Number(selectedServicio.precio),
                            comuna: selectedServicio.comuna,
                            imagenPrincipal: selectedServicio.imagenPrincipal,
                            imagenes: selectedServicio.imagenes,
                            nombreContacto: selectedServicio.nombreContacto,
                            emailContacto: selectedServicio.emailContacto,
                            telefonoContacto: selectedServicio.telefonoContacto,
                            // biome-ignore lint/suspicious/noExplicitAny: Datos legacy
                            redesSociales: selectedServicio.redesSociales as any,
                            categories: selectedServicio.categories,
                        }}
                        categorias={categorias}
                        usuario={usuario}
                        onSuccess={handleSuccess}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedServicio(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}
