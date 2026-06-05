'use client';

import { getInteraccionIcon, getInteraccionLabel } from '@/features/analytics/utils';

import { Pill } from '@/shared/components/hireeo';
import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { useDataTable } from '@/shared/components/ui/data-table/useDataTable';

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

    const columns: Column<Interaccion>[] = [
        {
            header: 'Tipo',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-tint p-2">
                        {getInteraccionIcon(item.tipo)}
                    </div>
                    <span className="text-sm font-bold text-sub">
                        {getInteraccionLabel(item.tipo)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Servicio',
            cell: (item) => (
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
            cell: (item) => (
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
            cell: (item) => (
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
