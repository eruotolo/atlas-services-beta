'use client';

import { getInteraccionIcon, getInteraccionLabel } from '@/features/analytics/utils';

import { Pill } from '@/shared/components/hireeo';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { useDataTable } from '@/shared/components/DataTable/useDataTable';

interface Interaccion {
    id: string;
    tipo: string;
    createdAt: Date;
    servicio: {
        titulo: string;
        usuario: {
            nombre: string;
        };
    };
    usuario: {
        nombre: string;
        email: string;
    } | null;
}

interface InteraccionesTableProps {
    result: {
        data: Interaccion[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export default function InteraccionesTable({ result }: InteraccionesTableProps) {
    const { currentPage, searchValue, isPending, handlePageChange, handleSearchChange } =
        useDataTable();

    const columns: ColumnDef<Interaccion>[] = [
        {
            header: 'Tipo',
            cell: ({ row: { original: item } }) => (
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-tint p-2">
                        {getInteraccionIcon(item.tipo)}
                    </div>
                    <span className="text-sm font-semibold text-sub">
                        {getInteraccionLabel(item.tipo)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Servicio',
            cell: ({ row: { original: item } }) => (
                <div>
                    <div className="text-sm font-medium text-ink">
                        {item.servicio.titulo}
                    </div>
                    <div className="text-xs text-muted">
                        de {item.servicio.usuario.nombre}
                    </div>
                </div>
            ),
        },
        {
            header: 'Usuario (Actor)',
            cell: ({ row: { original: item } }) => (
                <div>
                    {item.usuario ? (
                        <>
                            <div className="text-sm font-medium text-ink">
                                {item.usuario.nombre}
                            </div>
                            <div className="text-xs text-muted">
                                {item.usuario.email}
                            </div>
                        </>
                    ) : (
                        <Pill tone="default">Visitante</Pill>
                    )}
                </div>
            ),
        },
        {
            header: 'Fecha',
            cell: ({ row: { original: item } }) => (
                <span className="text-xs text-muted">
                    {new Date(item.createdAt).toLocaleString('es-CL')}
                </span>
            ),
        },
    ];

    return (
        <DataTable
            data={result.data}
            columns={columns}
            pageCount={result.meta.totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            searchPlaceholder="Buscar por servicio o usuario..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            title="Últimas Interacciones"
            totalCount={result.meta.total}
            isLoading={isPending}
        />
    );
}
