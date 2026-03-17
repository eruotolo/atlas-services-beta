'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Check, Edit2, Trash2 } from 'lucide-react';

type EstadoComentario = 'PENDIENTE' | 'ACTIVO' | 'ELIMINADO';

import { actualizarCalificacion, eliminarCalificacion } from '@/features/reviews/actions';

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

    function getStatusBadge(estado: string) {
        switch (estado) {
            case 'ACTIVO':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'ELIMINADO':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    }

    // Definir las columnas de la tabla
    const columns: Column<Calificacion>[] = [
        {
            header: 'Servicio',
            cell: (calificacion) => (
                <div
                    className="line-clamp-1 max-w-[150px] font-bold text-gray-900 dark:text-white"
                    title={calificacion.servicio.titulo}
                >
                    {calificacion.servicio.titulo}
                </div>
            ),
        },
        {
            header: 'Usuario',
            cell: (calificacion) => (
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                        {calificacion.usuario.nombre}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                        {calificacion.usuario.email}
                    </div>
                </div>
            ),
        },
        {
            header: 'Calificación',
            cell: (calificacion) => (
                <div className="flex text-yellow-400">
                    {'★'.repeat(calificacion.estrellas)}
                    <span className="text-gray-200 dark:text-gray-700">
                        {'★'.repeat(5 - calificacion.estrellas)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Comentario',
            cell: (calificacion) => (
                <div
                    className="line-clamp-2 max-w-[250px] text-gray-600 dark:text-gray-400"
                    title={calificacion.comentario || ''}
                >
                    {calificacion.comentario || (
                        <span className="text-gray-400 italic dark:text-gray-600">
                            Sin comentario
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (calificacion) => (
                <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${getStatusBadge(
                        calificacion.estado,
                    )}`}
                >
                    {calificacion.estado}
                </span>
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
                            className="cursor-pointer rounded-xl p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/30"
                            title="Aprobar"
                        >
                            <Check size={18} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleEdit(calificacion)}
                        disabled={!!isProcessing}
                        className="cursor-pointer rounded-xl p-2 text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(calificacion.id)}
                        disabled={!!isProcessing}
                        className="cursor-pointer rounded-xl p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30"
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
