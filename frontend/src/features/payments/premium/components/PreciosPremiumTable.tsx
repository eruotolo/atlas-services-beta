'use client';

import { useState } from 'react';

import { Edit2, Plus, Trash2 } from 'lucide-react';

import Modal from '@/shared/components/admin/Modal';
import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { useDataTable } from '@/shared/components/ui/data-table/useDataTable';

import type { PrecioPremium } from '../../types/paymentTypes';
import { eliminarPrecioPremium, toggleActivoPrecioPremium } from '../actions';
import PrecioPremiumForm from './PrecioPremiumForm';

interface PreciosPremiumTableProps {
    result: {
        data: PrecioPremium[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export default function PreciosPremiumTable({ result }: PreciosPremiumTableProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPrecio, setSelectedPrecio] = useState<PrecioPremium | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const { currentPage, searchValue, isPending, handlePageChange, handleSearchChange } =
        useDataTable();

    function handleEdit(precio: PrecioPremium) {
        setSelectedPrecio(precio);
        setIsEditModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este precio? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(id);
        try {
            const result = await eliminarPrecioPremium(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al eliminar precio');
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(id: string) {
        try {
            const result = await toggleActivoPrecioPremium(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al cambiar estado');
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedPrecio(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: Column<PrecioPremium>[] = [
        {
            header: 'Duración',
            cell: (precio) => (
                <span className="font-bold text-gray-900 dark:text-white">
                    {precio.duracionMeses} {precio.duracionMeses === 1 ? 'mes' : 'meses'}
                </span>
            ),
        },
        {
            header: 'Precio',
            cell: (precio) => (
                <span className="text-gray-600 dark:text-gray-400">
                    ${Number(precio.precio).toLocaleString('es-CL')}
                </span>
            ),
        },
        {
            header: 'Descripción',
            cell: (precio) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {precio.descripcion || '-'}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: (precio) => (
                <button
                    type="button"
                    onClick={() => handleToggleActivo(precio.id)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-all hover:scale-105 ${
                        precio.activo
                            ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500'
                    }`}
                    title={precio.activo ? 'Click para desactivar' : 'Click para activar'}
                >
                    {precio.activo ? 'Activo' : 'Inactivo'}
                </button>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            cell: (precio) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(precio)}
                        className="cursor-pointer rounded-xl p-2 text-brand transition-colors hover:bg-brand/5 dark:text-brand-light dark:hover:bg-brand-marino/30"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(precio.id)}
                        disabled={isDeleting === precio.id}
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
                searchPlaceholder="Buscar precio..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Precios Premium"
                totalCount={result.meta.total}
                isLoading={isPending}
                actionButton={
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nuevo Precio</span>
                    </button>
                }
            />

            {/* Modal Crear */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Precio Premium"
            >
                <PrecioPremiumForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Modal Editar */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPrecio(null);
                }}
                title="Editar Precio Premium"
            >
                {selectedPrecio && (
                    <PrecioPremiumForm
                        precioPremium={selectedPrecio}
                        onSuccess={handleSuccess}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedPrecio(null);
                        }}
                    />
                )}
            </Modal>
        </>
    );
}
