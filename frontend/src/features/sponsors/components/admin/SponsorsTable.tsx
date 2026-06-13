'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Edit2, Eye, EyeOff, Plus, Trash2 } from '@/shared/components/icons';

import type { Country } from '@/features/geo/types/geoTypes';
import { eliminarSponsor, toggleActivoSponsor } from '@/features/sponsors/actions';

import { Pill, Btn } from '@/shared/components/hireeo';
import Modal from '@/shared/components/admin/Modal';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { useDataTable } from '@/shared/components/DataTable/useDataTable';
import { notify } from '@/shared/lib/notify';

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
    countries?: Country[];
}

export default function SponsorsTable({ result, countries = [] }: SponsorsTableProps) {
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
                notify.error({ title: 'Error al eliminar', description: result.error });
            } else {
                notify.success({ title: 'Sponsor eliminado' });
                window.location.reload();
            }
        } catch (_error) {
            notify.error({ title: 'Error al eliminar sponsor' });
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggleActivo(sponsor: Sponsor) {
        try {
            const result = await toggleActivoSponsor(sponsor.id, !sponsor.activo);
            if (result.error) {
                notify.error({ title: 'Error al cambiar estado', description: result.error });
            } else {
                notify.success({
                    title: sponsor.activo ? 'Sponsor desactivado' : 'Sponsor activado',
                });
                window.location.reload();
            }
        } catch (_error) {
            notify.error({ title: 'Error al cambiar estado del sponsor' });
        }
    }

    function handleSuccess() {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedSponsor(null);
        window.location.reload();
    }

    // Definir las columnas de la tabla
    const columns: ColumnDef<Sponsor>[] = [
        {
            header: 'Logo',
            cell: ({ row: { original: sponsor } }) => (
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
            cell: ({ row: { original: sponsor } }) => (
                <span className="font-semibold text-ink">{sponsor.nombre}</span>
            ),
        },
        {
            header: 'Sitio Web',
            cell: ({ row: { original: sponsor } }) => (
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
            cell: ({ row: { original: sponsor } }) => (
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
            header: 'País',
            cell: ({ row: { original: sponsor } }) => (
                <Pill tone={sponsor.pais ? 'default' : 'success'}>
                    {sponsor.pais ? sponsor.pais.nombre : 'Global'}
                </Pill>
            ),
        },
        {
            header: 'Inicio',
            cell: ({ row: { original: sponsor } }) => (
                <span className="text-muted">
                    {new Date(sponsor.fechaInicio).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Fin',
            cell: ({ row: { original: sponsor } }) => (
                <span className="text-muted">
                    {new Date(sponsor.fechaFin).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: ({ row: { original: sponsor } }) => (
                <Pill tone={sponsor.activo ? 'success' : 'danger'}>
                    {sponsor.activo ? 'Activo' : 'Inactivo'}
                </Pill>
            ),
        },
        {
            header: 'Acciones',
            meta: { className: 'text-right' },
            cell: ({ row: { original: sponsor } }) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleToggleActivo(sponsor)}
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
                    <Btn
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nuevo Sponsor</span>
                    </Btn>
                }
            />

            {/* Modal Crear */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Nuevo Sponsor"
            >
                <SponsorForm
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
                    setSelectedSponsor(null);
                }}
                title="Editar Sponsor"
            >
                {selectedSponsor && (
                    <SponsorForm
                        sponsor={selectedSponsor}
                        countries={countries}
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
