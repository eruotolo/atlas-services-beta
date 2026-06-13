'use client';

import { useState } from 'react';

import { Edit2, Plus, Trash2 } from 'lucide-react';

import { eliminarCategoria, toggleActivoCategoria } from '@/features/categories/actions';

import { Pill } from '@/shared/components/hireeo';
import Modal from '@/shared/components/admin/Modal';
import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { useDataTable } from '@/shared/components/ui/data-table/useDataTable';

import CategoriaForm from './CategoriaForm';

interface CategoriaServicio {
    id: string;
    nombre: string;
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
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al eliminar categoría');
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(id: string) {
        try {
            const result = await toggleActivoCategoria(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al cambiar estado de la categoría');
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedCategoria(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: Column<CategoriaServicio>[] = [
        {
            header: 'Icono',
            cell: (categoria) => (
                <span className="font-mono text-xs text-muted">
                    {categoria.icono || '-'}
                </span>
            ),
        },
        {
            header: 'Nombre',
            cell: (categoria) => (
                <span className="font-bold text-ink">{categoria.nombre}</span>
            ),
        },
        {
            header: 'Slug',
            cell: (categoria) => (
                <span className="text-muted">{categoria.slug}</span>
            ),
        },
        {
            header: 'Orden',
            cell: (categoria) => (
                <span className="text-muted">{categoria.orden}</span>
            ),
        },
        {
            header: 'Estado',
            cell: (categoria) => (
                <button
                    type="button"
                    onClick={() => handleToggleActivo(categoria.id)}
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
            className: 'text-right',
            cell: (categoria) => (
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
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nueva Categoría</span>
                    </button>
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
