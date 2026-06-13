'use client';

import { useState } from 'react';

import { Edit2, Plus, Trash2 } from '@/shared/components/icons';

import { eliminarUsuario } from '@/features/users/actions';

import { Avatar, Pill, Btn } from '@/shared/components/hireeo';
import Modal from '@/shared/components/admin/Modal';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { useDataTable } from '@/shared/components/DataTable/useDataTable';
import { notify } from '@/shared/lib/notify';

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
        country?: { code: string; name: string } | null;
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

interface CountryOption {
    code: string;
    name: string;
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
    countries: CountryOption[];
}

export default function UsuariosTable({ result, roles, countries }: UsuariosTableProps) {
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
                notify.error({ title: 'Error al eliminar usuario', description: result.error });
            } else {
                notify.success({ title: 'Usuario eliminado' });
                window.location.reload();
            }
        } catch (_error) {
            notify.error({ title: 'Error al eliminar usuario' });
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
    const columns: ColumnDef<Usuario>[] = [
        {
            header: 'Nombre',
            cell: ({ row: { original: usuario } }) => (
                <div className="flex items-center gap-2.5">
                    <Avatar name={usuario.nombre} size={30} />
                    <span className="font-semibold text-ink">{usuario.nombre}</span>
                </div>
            ),
        },
        {
            header: 'Email',
            cell: ({ row: { original: usuario } }) => (
                <span className="text-sub">{usuario.email}</span>
            ),
        },
        {
            header: 'Rol',
            cell: ({ row: { original: usuario } }) => (
                <div className="flex gap-1">
                    {usuario.roles.map((ur) => (
                        <Pill
                            key={ur.id}
                            tone={ur.role.nombre.includes('Super') ? 'accent' : 'ink'}
                        >
                            {ur.role.nombre}
                        </Pill>
                    ))}
                </div>
            ),
        },
        {
            header: 'País',
            cell: ({ row: { original: usuario } }) => {
                const assignment = usuario.roles.find((ur) => ur.country != null);
                return assignment?.country ? (
                    <span className="text-sm font-medium text-ink">
                        {assignment.country.code.toUpperCase()}
                        <span className="ml-1 font-normal text-sub">· {assignment.country.name}</span>
                    </span>
                ) : (
                    <span className="text-sub">—</span>
                );
            },
        },
        {
            header: 'Servicios',
            cell: ({ row: { original: usuario } }) => (
                <span className="text-sub">{usuario._count.servicios}</span>
            ),
        },
        {
            header: 'Acciones',
            meta: { className: 'text-right' },
            cell: ({ row: { original: usuario } }) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(usuario)}
                        className="cursor-pointer rounded-xl p-2 text-brand transition-colors hover:bg-brand/5"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(usuario.id)}
                        disabled={isDeleting === usuario.id}
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
                searchPlaceholder="Buscar usuario..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Administradores de la plataforma"
                totalCount={result.meta.total}
                isLoading={isPending}
                actionButton={
                    <Btn
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nuevo Usuario</span>
                    </Btn>
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
                    setSelectedUsuario(null);
                }}
                title="Editar Usuario"
            >
                {selectedUsuario && (
                    <UsuarioForm
                        usuario={selectedUsuario}
                        roles={roles}
                        countries={countries}
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
