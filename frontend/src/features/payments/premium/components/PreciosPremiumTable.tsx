'use client';

import { useState } from 'react';

import { Edit2, Plus, Trash2 } from '@/shared/components/icons';

import Modal from '@/shared/components/admin/Modal';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { useDataTable } from '@/shared/components/DataTable/useDataTable';
import { Btn } from '@/shared/components/hireeo';
import { Pill } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';

import type { PrecioPremium } from '../../types/paymentTypes';
import { eliminarPrecioPremium, toggleActivoPrecioPremium } from '../actions';
import type { Country } from '@/features/geo/types/geoTypes';
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
    countries: Country[];
}

export default function PreciosPremiumTable({ result, countries }: PreciosPremiumTableProps) {
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
                notify.error({ title: 'Error al eliminar precio', description: result.error });
            } else {
                notify.success({ title: 'Precio eliminado' });
                window.location.reload();
            }
        } catch (_error) {
            notify.error({ title: 'Error al eliminar precio' });
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(id: string) {
        try {
            const result = await toggleActivoPrecioPremium(id);
            if (result.error) {
                notify.error({ title: 'Error al cambiar estado', description: result.error });
            } else {
                notify.success({ title: 'Estado del precio actualizado' });
                window.location.reload();
            }
        } catch (_error) {
            notify.error({ title: 'Error al cambiar estado' });
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedPrecio(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: ColumnDef<PrecioPremium>[] = [
        {
            header: 'Duración',
            cell: ({ row: { original: precio } }) => (
                <span className="font-semibold text-ink">
                    {precio.duracionMeses} {precio.duracionMeses === 1 ? 'mes' : 'meses'}
                </span>
            ),
        },
        {
            header: 'Precio',
            cell: ({ row: { original: precio } }) => (
                <span className="text-sub">
                    ${Number(precio.precio).toLocaleString('es-CL')}
                </span>
            ),
        },
        {
            header: 'Descripción',
            cell: ({ row: { original: precio } }) => (
                <span className="text-sub">
                    {precio.descripcion || '-'}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: ({ row: { original: precio } }) => (
                <button
                    type="button"
                    onClick={() => handleToggleActivo(precio.id)}
                    className="cursor-pointer transition-all hover:scale-105"
                    title={precio.activo ? 'Click para desactivar' : 'Click para activar'}
                >
                    <Pill tone={precio.activo ? 'success' : 'default'}>
                        {precio.activo ? 'Activo' : 'Inactivo'}
                    </Pill>
                </button>
            ),
        },
        {
            header: 'Acciones',
            meta: { className: 'text-right' },
            cell: ({ row: { original: precio } }) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(precio)}
                        className="cursor-pointer rounded-xl p-2 text-brand transition-colors hover:bg-brand/5"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(precio.id)}
                        disabled={isDeleting === precio.id}
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
                searchPlaceholder="Buscar precio..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Precios Premium"
                totalCount={result.meta.total}
                isLoading={isPending}
                actionButton={
                    <Btn
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nuevo Precio</span>
                    </Btn>
                }
            />

            {/* Modal Crear */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Precio Premium"
            >
                <PrecioPremiumForm
                    countries={countries}
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
                        countries={countries}
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
