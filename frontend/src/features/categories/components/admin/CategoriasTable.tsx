'use client';

import { useState } from 'react';

import { Edit2, Plus, Trash2 } from '@/shared/components/icons';

import { eliminarCategoria, toggleActivoCategoria } from '@/features/categories/actions';

import { Pill, Btn } from '@/shared/components/hireeo';
import Modal from '@/shared/components/admin/Modal';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { useDataTable } from '@/shared/components/DataTable/useDataTable';
import { notify } from '@/shared/lib/notify';

import CategoriaForm from './CategoriaForm';

interface CategoriaServicio {
    id: string;
    nombre: string;
    nombreEn?: string | null;
    slug: string;
    icono: string | null;
    orden: number;
    activo: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CategoriasTableProps {
    result: {
        data: CategoriaServicio[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export default function CategoriasTable({ result }: CategoriasTableProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState<CategoriaServicio | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const { currentPage, searchValue, isPending, handlePageChange, handleSearchChange } =
        useDataTable();

    function handleEdit(categoria: CategoriaServicio) {
        setSelectedCategoria(categoria);
        setIsEditModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (
            !confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')
        ) {
            return;
        }

        setIsDeleting(id);
        try {
            const result = await eliminarCategoria(id);
            if (result.error) {
                notify.error({ title: 'Error al eliminar', description: result.error });
            } else {
                notify.success({ title: 'Categoría eliminada' });
                window.location.reload();
            }
        } catch (_error) {
            notify.error({ title: 'Error al eliminar categoría' });
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(categoria: CategoriaServicio) {
        try {
            const result = await toggleActivoCategoria(categoria.id, !categoria.activo);
            if (result.error) {
                notify.error({ title: 'Error al cambiar estado', description: result.error });
            } else {
                notify.success({
                    title: categoria.activo ? 'Categoría desactivada' : 'Categoría activada',
                });
                window.location.reload();
            }
        } catch (_error) {
            notify.error({ title: 'Error al cambiar estado de la categoría' });
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedCategoria(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: ColumnDef<CategoriaServicio>[] = [
        {
            header: 'Icono',
            cell: ({ row: { original: categoria } }) => (
                <span className="font-mono text-xs text-muted">
                    {categoria.icono || '-'}
                </span>
            ),
        },
        {
            header: 'Nombre',
            cell: ({ row: { original: categoria } }) => (
                <span className="font-semibold text-ink">{categoria.nombre}</span>
            ),
        },
        {
            header: 'Nombre (EN)',
            cell: ({ row: { original: categoria } }) => (
                <span className="text-sub">
                    {categoria.nombreEn || <span className="text-muted italic">—</span>}
                </span>
            ),
        },
        {
            header: 'Slug',
            cell: ({ row: { original: categoria } }) => (
                <span className="text-muted">{categoria.slug}</span>
            ),
        },
        {
            header: 'Orden',
            cell: ({ row: { original: categoria } }) => (
                <span className="text-muted">{categoria.orden}</span>
            ),
        },
        {
            header: 'Estado',
            cell: ({ row: { original: categoria } }) => (
                <button
                    type="button"
                    onClick={() => handleToggleActivo(categoria)}
                    className="cursor-pointer transition-all hover:scale-105"
                    title={categoria.activo ? 'Click para desactivar' : 'Click para activar'}
                >
                    <Pill tone={categoria.activo ? 'success' : 'default'}>
                        {categoria.activo ? 'Activa' : 'Inactiva'}
                    </Pill>
                </button>
            ),
        },
        {
            header: 'Acciones',
            meta: { className: 'text-right' },
            cell: ({ row: { original: categoria } }) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(categoria)}
                        className="cursor-pointer rounded-xl p-2 text-brand transition-colors hover:bg-brand/5"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(categoria.id)}
                        disabled={isDeleting === categoria.id}
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
                searchPlaceholder="Buscar categoría..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Categorías"
                totalCount={result.meta.total}
                isLoading={isPending}
                actionButton={
                    <Btn
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nueva Categoría</span>
                    </Btn>
                }
            />

            {/* Modal Crear */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Nueva Categoría"
            >
                <CategoriaForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Modal Editar */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategoria(null);
                }}
                title="Editar Categoría"
            >
                {selectedCategoria && (
                    <CategoriaForm
                        categoria={selectedCategoria}
                        onSuccess={handleSuccess}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedCategoria(null);
                        }}
                    />
                )}
            </Modal>
        </>
    );
}
