'use client';

import { useState } from 'react';

import { AlertCircle, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import { eliminarServicioPropio, toggleActivoServicioPropio } from '@/features/users/actions';
import Modal from '@/shared/components/admin/Modal';
import { Btn, Pill } from '@/shared/components/hireeo';

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

interface ServicioCardProps {
    servicio: Servicio;
    isDeleting: boolean;
    onToggle: (id: string) => void;
    onEdit: (s: Servicio) => void;
    onDelete: (id: string) => void;
    upgradeHref: string;
}

function formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function ServicioCard({ servicio, isDeleting, onToggle, onEdit, onDelete, upgradeHref }: ServicioCardProps) {
    const categoriaLabel =
        servicio.categories && servicio.categories.length > 0
            ? servicio.categories.map((c) => c.nombre).join(', ')
            : servicio.categoria;

    return (
        <div
            className="relative overflow-hidden rounded-2xl border bg-bg transition-shadow hover:shadow-sm"
            style={{ borderColor: 'var(--line)', padding: 20 }}
        >
            {servicio.destacado && (
                <div
                    className="absolute top-0 bottom-0 left-0 w-1"
                    style={{ background: 'var(--accent)' }}
                />
            )}
            <div className="flex flex-col gap-5 md:flex-row">
                <div className="flex-grow space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                            className="text-[10px] font-semibold tracking-widest uppercase"
                            style={{ color: 'var(--accent)' }}
                        >
                            {categoriaLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {servicio.nivel === 'PREMIUM' ? (
                                <Pill tone="warning" icon="crown">Premium</Pill>
                            ) : (
                                <Pill tone="default">Básico</Pill>
                            )}
                            {servicio.destacado && <Pill tone="accent">Destacado</Pill>}
                            <Pill tone={servicio.activo ? 'success' : 'default'}>
                                {servicio.activo ? 'Activo' : 'Inactivo'}
                            </Pill>
                        </div>
                    </div>

                    <h4
                        className="line-clamp-1 text-[15px] font-semibold"
                        style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
                    >
                        {servicio.titulo}
                    </h4>
                    <p className="line-clamp-2 text-[13px]" style={{ color: 'var(--sub)' }}>
                        {servicio.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                        <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
                            {servicio.comuna}
                        </span>
                        <span
                            className="text-[13px] font-semibold tabular-nums"
                            style={{ color: 'var(--ink)' }}
                        >
                            ${servicio.precio.toLocaleString('es-CL')}
                        </span>
                    </div>

                    {servicio.nivel === 'PREMIUM' && servicio.suscripcion && (
                        <div
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px]"
                            style={{
                                background: 'rgba(245,158,11,0.08)',
                                border: '1px solid rgba(245,158,11,0.2)',
                                color: '#92400e',
                            }}
                        >
                            <span className="font-semibold">
                                Premium hasta {formatearFecha(servicio.fechaFin)}
                            </span>
                            <span style={{ opacity: 0.7 }}>
                                · {servicio.suscripcion.duracionMeses}{' '}
                                {servicio.suscripcion.duracionMeses === 1 ? 'mes' : 'meses'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col justify-center gap-2 md:w-[180px]">
                    <Btn variant="secondary" size="sm" onClick={() => onToggle(servicio.id)}>
                        {servicio.activo ? (
                            <><EyeOff size={12} className="mr-1" /> Desactivar</>
                        ) : (
                            <><span className="mr-1">👁</span> Activar</>
                        )}
                    </Btn>
                    <Btn variant="secondary" size="sm" icon="edit" onClick={() => onEdit(servicio)}>
                        Editar
                    </Btn>
                    <Btn
                        variant="danger"
                        size="sm"
                        icon="trash"
                        disabled={isDeleting}
                        onClick={() => onDelete(servicio.id)}
                    >
                        Eliminar
                    </Btn>
                    {servicio.nivel === 'BASICO' && (
                        <Btn variant="accent" size="sm" icon="crown" href={upgradeHref}>
                            Actualizar a Premium
                        </Btn>
                    )}
                </div>
            </div>
        </div>
    );
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
        if (!confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
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

    if (servicios.length === 0) {
        return (
            <div className="rounded-[2rem] border-2 border-dashed border-line bg-bg p-16 text-center">
                <div
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ background: 'var(--tint)' }}
                >
                    <AlertCircle size={40} style={{ color: 'var(--muted)' }} />
                </div>
                <h4 className="mb-2 text-xl font-bold" style={{ color: 'var(--ink)' }}>
                    Aún no tienes servicios activos
                </h4>
                <p
                    className="mx-auto mb-8 max-w-xs text-sm leading-relaxed"
                    style={{ color: 'var(--muted)' }}
                >
                    Publica tu oficio hoy mismo y empieza a recibir llamados de clientes en tu zona.
                </p>
                <Btn icon="zap" size="lg" href={link('/publish')}>
                    Crear mi primer aviso
                </Btn>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4">
                {servicios.map((servicio) => (
                    <ServicioCard
                        key={servicio.id}
                        servicio={servicio}
                        isDeleting={isDeleting === servicio.id}
                        onToggle={handleToggleActivo}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        upgradeHref={link(`/publish?upgrade=${servicio.id}`)}
                    />
                ))}
            </div>

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
        </>
    );
}
