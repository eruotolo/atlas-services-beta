'use client';

import { useState } from 'react';

import { Edit2, Eye, EyeOff, Plus, Star, Trash2 } from 'lucide-react';

import {
    eliminarServicio,
    toggleActivoServicio,
    toggleDestacadoServicio,
} from '@/features/services/actions';

import Modal from '@/shared/components/admin/Modal';
import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { useDataTable } from '@/shared/components/ui/data-table/useDataTable';

import AdminServicioForm from './AdminServicioForm';

interface Servicio {
    id: string;
    titulo: string;
    categoriaId: string;
    descripcion: string;
    // biome-ignore lint/suspicious/noExplicitAny: Precio puede venir como string o number
    precio: any;
    comuna: string;
    usuarioId: string;
    activo: boolean;
    destacado: boolean;
    usuario: {
        nombre: string;
        email: string;
    };
    categoria: {
        nombre: string;
    };
    categories?: Array<{
        id: string;
        nombre: string;
    }>;
    redesSociales?: {
        tipo: string;
        url: string;
    }[];
    nombreContacto?: string | null;
    emailContacto?: string | null;
    telefonoContacto?: string | null;
}

interface Usuario {
    id: string;
    nombre: string;
    email: string;
}

interface CategoriaServicio {
    id: string;
    nombre: string;
}

interface ServiciosTableProps {
    result: {
        data: Servicio[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    usuarios: Usuario[];
    categorias: CategoriaServicio[];
}

export default function ServiciosTable({ result, usuarios, categorias }: ServiciosTableProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const { currentPage, searchValue, isPending, handlePageChange, handleSearchChange } =
        useDataTable();

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
            const result = await eliminarServicio(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al eliminar servicio');
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(id: string) {
        try {
            const result = await toggleActivoServicio(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al cambiar estado del servicio');
        }
    }

    async function handleToggleDestacado(id: string) {
        try {
            const result = await toggleDestacadoServicio(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al cambiar destacado del servicio');
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedServicio(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: Column<Servicio>[] = [
        {
            header: 'Servicio',
            cell: (servicio) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                        {servicio.titulo}
                    </span>
                    {servicio.destacado && (
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                    )}
                </div>
            ),
        },
        {
            header: 'Categorías',
            cell: (servicio) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {servicio.categories && servicio.categories.length > 0
                        ? servicio.categories.map((c) => c.nombre).join(', ')
                        : servicio.categoria.nombre}
                </span>
            ),
        },
        {
            header: 'Proveedor',
            cell: (servicio) => (
                <span className="text-gray-600 dark:text-gray-400">{servicio.usuario.nombre}</span>
            ),
        },
        {
            header: 'Precio',
            cell: (servicio) => (
                <span className="font-bold text-gray-900 dark:text-white">
                    ${Number(servicio.precio).toLocaleString('es-CL')}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: (servicio) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                        servicio.activo
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                    }`}
                >
                    {servicio.activo ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            cell: (servicio) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleToggleActivo(servicio.id)}
                        className="cursor-pointer rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        title={servicio.activo ? 'Desactivar' : 'Activar'}
                    >
                        {servicio.activo ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggleDestacado(servicio.id)}
                        className={`cursor-pointer rounded-xl p-2 transition-colors ${
                            servicio.destacado
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                : 'text-gray-400 hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800'
                        }`}
                        title={servicio.destacado ? 'Quitar destacado' : 'Destacar'}
                    >
                        <Star size={18} className={servicio.destacado ? 'fill-amber-600' : ''} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleEdit(servicio)}
                        className="cursor-pointer rounded-xl p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(servicio.id)}
                        disabled={isDeleting === servicio.id}
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
                searchPlaceholder="Buscar servicio..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Servicios Publicados"
                totalCount={result.meta.total}
                isLoading={isPending}
                actionButton={
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white transition-all hover:bg-blue-600 dark:shadow-none"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nuevo Servicio</span>
                    </button>
                }
            />

            {/* Modal Crear */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Nuevo Servicio"
            >
                <AdminServicioForm
                    usuarios={usuarios}
                    categorias={categorias}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

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
                    <AdminServicioForm
                        servicio={{
                            id: selectedServicio.id,
                            titulo: selectedServicio.titulo,
                            categoria: selectedServicio.categoriaId,
                            descripcion: selectedServicio.descripcion,
                            precio: Number(selectedServicio.precio),
                            comuna: selectedServicio.comuna,
                            usuarioId: selectedServicio.usuarioId,
                            nombreContacto: selectedServicio.nombreContacto,
                            emailContacto: selectedServicio.emailContacto,
                            telefonoContacto: selectedServicio.telefonoContacto,
                            // biome-ignore lint/suspicious/noExplicitAny: Datos legacy pueden variar
                            imagenPrincipal: (selectedServicio as any).imagenPrincipal,
                            // biome-ignore lint/suspicious/noExplicitAny: Datos legacy pueden variar
                            imagenes: (selectedServicio as any).imagenes || [],
                            // biome-ignore lint/suspicious/noExplicitAny: Datos legacy pueden variar
                            redesSociales: (selectedServicio.redesSociales as any) || [],
                            categories: selectedServicio.categories,
                        }}
                        usuarios={usuarios}
                        categorias={categorias}
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
