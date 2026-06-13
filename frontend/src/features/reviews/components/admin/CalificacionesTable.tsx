'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Check, Edit2, Trash2 } from 'lucide-react';

type EstadoComentario = 'PENDIENTE' | 'ACTIVO' | 'ELIMINADO';

import { actualizarCalificacion, eliminarCalificacion } from '@/features/reviews/actions';

import { Avatar, Pill, Stars } from '@/shared/components/hireeo';

import Modal from '@/shared/components/admin/Modal';
import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { useDataTable } from '@/shared/components/ui/data-table/useDataTable';

import CalificacionForm from './CalificacionForm';

interface Calificacion {
    id: string;
    estrellas: number;
    comentario: string | null;
    estado: EstadoComentario;
    createdAt: Date;
    usuario: {
        nombre: string;
        email: string;
    };
    servicio: {
        id: string;
        titulo: string;
    };
}

interface CalificacionesTableProps {
    result: {
        data: Calificacion[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export default function CalificacionesTable({ result }: CalificacionesTableProps) {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCalificacion, setSelectedCalificacion] = useState<Calificacion | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const { currentPage, searchValue, isPending, handlePageChange, handleSearchChange } =
        useDataTable();

    function handleEdit(calificacion: Calificacion) {
        setSelectedCalificacion(calificacion);
        setIsEditModalOpen(true);
    }

    async function handleApprove(id: string) {
        setIsProcessing(id);
        try {
            await actualizarCalificacion({ id, estado: 'ACTIVO' });
            router.refresh();
        } catch (error) {
            console.error('Error aprobando:', error);
            alert('Error al aprobar la reseña');
        } finally {
            setIsProcessing(null);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar esta reseña?')) {
            return;
        }

        setIsProcessing(id);
        try {
            const result = await eliminarCalificacion(id);
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
            }
        } catch (_error) {
            alert('Error al eliminar reseña');
        } finally {
            setIsProcessing(null);
        }
    }

    function handleSuccess() {
        setIsEditModalOpen(false);
        setSelectedCalificacion(null);
        router.refresh();
    }

    function getStatusTone(estado: string): 'success' | 'warning' | 'danger' | 'default' {
        switch (estado) {
            case 'ACTIVO':
                return 'success';
            case 'PENDIENTE':
                return 'warning';
            case 'ELIMINADO':
                return 'danger';
            default:
                return 'default';
        }
    }

    // Definir las columnas de la tabla
    const columns: Column<Calificacion>[] = [
        {
            header: 'Servicio',
            cell: (calificacion) => (
                <div
                    className="line-clamp-1 max-w-[150px] font-bold text-ink"
                    title={calificacion.servicio.titulo}
                >
                    {calificacion.servicio.titulo}
                </div>
            ),
        },
        {
            header: 'Usuario',
            cell: (calificacion) => (
                <div className="flex items-center gap-2.5">
                    <Avatar name={calificacion.usuario.nombre} size={28} />
                    <div>
                        <div className="font-bold text-ink">
                            {calificacion.usuario.nombre}
                        </div>
                        <div className="text-xs text-muted">
                            {calificacion.usuario.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Calificación',
            cell: (calificacion) => (
                <Stars rating={calificacion.estrellas} size={14} />
            ),
        },
        {
            header: 'Comentario',
            cell: (calificacion) => (
                <div
                    className="line-clamp-2 max-w-[250px] text-sub"
                    title={calificacion.comentario || ''}
                >
                    {calificacion.comentario || (
                        <span className="text-muted italic">
                            Sin comentario
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (calificacion) => (
                <Pill tone={getStatusTone(calificacion.estado)}>
                    {calificacion.estado}
                </Pill>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            cell: (calificacion) => (
                <div className="flex justify-end gap-2">
                    {calificacion.estado === 'PENDIENTE' && (
                        <button
                            type="button"
                            onClick={() => handleApprove(calificacion.id)}
                            disabled={!!isProcessing}
                            className="cursor-pointer rounded-xl p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                            title="Aprobar"
                        >
                            <Check size={18} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleEdit(calificacion)}
                        disabled={!!isProcessing}
                        className="cursor-pointer rounded-xl p-2 text-brand transition-colors hover:bg-brand/5 disabled:opacity-50"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(calificacion.id)}
                        disabled={!!isProcessing}
                        className="cursor-pointer rounded-xl p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                data={result.data}
                columns={columns}
                pageCount={result.meta.totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                searchPlaceholder="Buscar por usuario, servicio o comentario..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Reseñas y Calificaciones"
                totalCount={result.meta.total}
                isLoading={isPending}
            />

            {/* Modal Editar */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCalificacion(null);
                }}
                title="Editar Reseña"
            >
                {selectedCalificacion && (
                    <CalificacionForm
                        calificacion={selectedCalificacion}
                        onSuccess={handleSuccess}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedCalificacion(null);
                        }}
                    />
                )}
            </Modal>
        </>
    );
}
