'use client';

import { useState } from 'react';

import { Edit2, Plus, Trash2 } from 'lucide-react';

import { eliminarUsuario } from '@/features/users/actions';

import Modal from '@/shared/components/admin/Modal';
import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { useDataTable } from '@/shared/components/ui/data-table/useDataTable';

import UsuarioForm from './UsuarioForm';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    roles: Array<{
        id: string;
        roleId: string;
        role: {
            nombre: string;
        };
    }>;
    _count: {
        servicios: number;
        calificaciones: number;
    };
}

interface Role {
    id: string;
    nombre: string;
}

interface UsuariosTableProps {
    result: {
        data: Usuario[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    roles: Role[];
}

export default function UsuariosTable({ result, roles }: UsuariosTableProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const { currentPage, searchValue, isPending, handlePageChange, handleSearchChange } =
        useDataTable();

    function handleEdit(usuario: Usuario) {
        setSelectedUsuario(usuario);
        setIsEditModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(id);
        try {
            const result = await eliminarUsuario(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al eliminar usuario');
        } finally {
            setIsDeleting(null);
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedUsuario(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: Column<Usuario>[] = [
        {
            header: 'Nombre',
            cell: (usuario) => (
                <span className="font-bold text-gray-900 dark:text-white">{usuario.nombre}</span>
            ),
        },
        {
            header: 'Email',
            cell: (usuario) => (
                <span className="text-gray-600 dark:text-gray-400">{usuario.email}</span>
            ),
        },
        {
            header: 'Roles',
            cell: (usuario) => (
                <div className="flex gap-1">
                    {usuario.roles.map((ur) => (
                        <span
                            key={ur.id}
                            className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                            {ur.role.nombre}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            header: 'Servicios',
            cell: (usuario) => (
                <span className="text-gray-600 dark:text-gray-400">{usuario._count.servicios}</span>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            cell: (usuario) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(usuario)}
                        className="cursor-pointer rounded-xl p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(usuario.id)}
                        disabled={isDeleting === usuario.id}
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
                searchPlaceholder="Buscar usuario..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Usuarios Registrados"
                totalCount={result.meta.total}
                isLoading={isPending}
                actionButton={
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-600 dark:shadow-none"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nuevo Usuario</span>
                    </button>
                }
            />

            {/* Modal Crear */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Nuevo Usuario"
            >
                <UsuarioForm
                    roles={roles}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Modal Editar */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUsuario(null);
                }}
                title="Editar Usuario"
            >
                {selectedUsuario && (
                    <UsuarioForm
                        usuario={selectedUsuario}
                        roles={roles}
                        onSuccess={handleSuccess}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedUsuario(null);
                        }}
                    />
                )}
            </Modal>
        </>
    );
}
