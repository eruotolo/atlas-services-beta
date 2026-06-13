'use client';

import { Table } from '@tanstack/react-table';
import { Btn } from '@/shared/components/hireeo/Btn';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    onPageChange?: (page: number) => void;
}

export function DataTablePagination<TData>({
    table,
    onPageChange,
}: DataTablePaginationProps<TData>) {
    const handlePageChange = (newPageIndex: number) => {
        table.setPageIndex(newPageIndex);
        if (onPageChange) {
            onPageChange(newPageIndex + 1);
        }
    };

    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 text-sm text-sub">
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-ink">
                        Página {table.getState().pagination.pageIndex + 1} de{' '}
                        {table.getPageCount() || 1}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Btn
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePageChange(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Primera
                    </Btn>
                    <Btn
                        variant="secondary"
                        size="sm"
                        icon="arrowLeft"
                        onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Btn>
                    <Btn
                        variant="secondary"
                        size="sm"
                        iconRight="arrow"
                        onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Btn>
                    <Btn
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePageChange(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        Última
                    </Btn>
                </div>
            </div>
        </div>
    );
}
