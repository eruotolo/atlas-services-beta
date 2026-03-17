'use client';

import { getInteraccionIcon, getInteraccionLabel } from '@/features/analytics/utils';

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
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                        {getInteraccionIcon(item.tipo)}
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {getInteraccionLabel(item.tipo)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Servicio',
            cell: (item) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.servicio.titulo}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.usuario.nombre}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.usuario.email}
                            </div>
                        </>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                            Visitante
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Fecha',
            cell: (item) => (
                <span className="text-xs text-gray-500 dark:text-gray-400">
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
