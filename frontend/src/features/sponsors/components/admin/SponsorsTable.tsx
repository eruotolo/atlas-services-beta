'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Edit2, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

import { eliminarSponsor, toggleActivoSponsor } from '@/features/sponsors/actions';

import { Pill } from '@/shared/components/hireeo';
import Modal from '@/shared/components/admin/Modal';
import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { useDataTable } from '@/shared/components/ui/data-table/useDataTable';

import type { Sponsor } from '../../types/sponsorTypes';
import SponsorForm from './SponsorForm';

interface SponsorsTableProps {
    result: {
        data: Sponsor[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export default function SponsorsTable({ result }: SponsorsTableProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const { currentPage, searchValue, isPending, handlePageChange, handleSearchChange } =
        useDataTable();

    function handleEdit(sponsor: Sponsor) {
        setSelectedSponsor(sponsor);
        setIsEditModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este sponsor? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(id);
        try {
            const result = await eliminarSponsor(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al eliminar sponsor');
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(id: string) {
        try {
            const result = await toggleActivoSponsor(id);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        } catch (_error) {
            alert('Error al cambiar estado del sponsor');
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedSponsor(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: Column<Sponsor>[] = [
        {
            header: 'Logo',
            cell: (sponsor) => (
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-tint p-1">
                    <Image
                        src={sponsor.imagenUrl}
                        alt={sponsor.nombre}
                        fill
                        className="object-contain"
                    />
                </div>
            ),
        },
        {
            header: 'Nombre',
            cell: (sponsor) => (
                <span className="font-bold text-ink">{sponsor.nombre}</span>
            ),
        },
        {
            header: 'Sitio Web',
            cell: (sponsor) => (
                <a
                    href={sponsor.linkExterno}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline"
                >
                    Ver sitio
                </a>
            ),
        },
        {
            header: 'Nivel',
            cell: (sponsor) => (
                <Pill
                    tone={
                        sponsor.nivel === 'SENIOR'
                            ? 'warning'
                            : sponsor.nivel === 'PREMIUM'
                              ? 'accent'
                              : 'default'
                    }
                    icon={
                        sponsor.nivel === 'SENIOR'
                            ? 'crown'
                            : sponsor.nivel === 'PREMIUM'
                              ? 'sparkle'
                              : undefined
                    }
                >
                    {sponsor.nivel}
                </Pill>
            ),
        },
        {
            header: 'Inicio',
            cell: (sponsor) => (
                <span className="text-muted">
                    {new Date(sponsor.fechaInicio).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Fin',
            cell: (sponsor) => (
                <span className="text-muted">
                    {new Date(sponsor.fechaFin).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: (sponsor) => (
                <Pill tone={sponsor.activo ? 'success' : 'danger'}>
                    {sponsor.activo ? 'Activo' : 'Inactivo'}
                </Pill>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            cell: (sponsor) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleToggleActivo(sponsor.id)}
                        className="cursor-pointer rounded-xl p-2 text-sub transition-colors hover:bg-tint"
                        title={sponsor.activo ? 'Desactivar' : 'Activar'}
                    >
                        {sponsor.activo ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleEdit(sponsor)}
                        className="cursor-pointer rounded-xl p-2 text-brand transition-colors hover:bg-brand/5"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(sponsor.id)}
                        disabled={isDeleting === sponsor.id}
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
                searchPlaceholder="Buscar sponsor..."
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                title="Sponsors"
                totalCount={result.meta.total}
                isLoading={isPending}
                actionButton={
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nuevo Sponsor</span>
                    </button>
                }
            />

            {/* Modal Crear */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Nuevo Sponsor"
            >
                <SponsorForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Modal Editar */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedSponsor(null);
                }}
                title="Editar Sponsor"
            >
                {selectedSponsor && (
                    <SponsorForm
                        sponsor={selectedSponsor}
                        onSuccess={handleSuccess}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedSponsor(null);
                        }}
                    />
                )}
            </Modal>
        </>
    );
}
