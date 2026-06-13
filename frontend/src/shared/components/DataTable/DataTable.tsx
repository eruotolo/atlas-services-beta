'use client';

import * as React from 'react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';

import { DataTablePagination } from './DataTablePagination';
import { Input } from '@/shared/components/hireeo/Input';
import { Btn, Icon } from '@/shared/components/hireeo';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    actionButton?: React.ReactNode;

    // Server-side pagination
    pageCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;

    isLoading?: boolean;
    title?: string;
    totalCount?: number;

    // Bulk actions: agrega columna de selección y toolbar contextual
    bulkActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode;
}

function buildSelectionColumn<TData, TValue>(): ColumnDef<TData, TValue> {
    return {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Seleccionar todo"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { className: 'w-10' },
    };
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = 'Buscar...',
    searchValue,
    onSearchChange,
    actionButton,
    pageCount,
    currentPage,
    onPageChange,
    isLoading,
    title,
    totalCount,
    bulkActions,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const tableColumns = React.useMemo(
        () => (bulkActions ? [buildSelectionColumn<TData, TValue>(), ...columns] : columns),
        [bulkActions, columns],
    );

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            ...(currentPage !== undefined ? { pagination: { pageIndex: currentPage - 1, pageSize: 10 } } : {}),
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        manualPagination: pageCount !== undefined,
        pageCount: pageCount,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    return (
        <div className="space-y-4">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {title && (
                    <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink">
                        {title}
                        {totalCount !== undefined && (
                            <span className="ml-2 text-[13px] font-medium text-muted tabular-nums">
                                ({totalCount})
                            </span>
                        )}
                    </h2>
                )}
                <div className="flex items-center gap-3 ml-auto">
                    {(searchKey || onSearchChange) && (
                        <div className="w-full sm:w-72">
                            <Input
                                icon="search"
                                placeholder={searchPlaceholder}
                                value={
                                    onSearchChange 
                                        ? (searchValue || '') 
                                        : ((table.getColumn(searchKey!)?.getFilterValue() as string) ?? '')
                                }
                                onChange={(event) => {
                                    if (onSearchChange) {
                                        onSearchChange(event.target.value);
                                    } else if (searchKey) {
                                        table.getColumn(searchKey)?.setFilterValue(event.target.value);
                                    }
                                }}
                            />
                        </div>
                    )}
                    
                    {/* Botón de Columnas */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Btn variant="secondary" size="sm" className="h-[40px]">
                                <Icon name="settings" size={16} className="mr-2" />
                                <span className="hidden lg:inline">Columnas</span>
                            </Btn>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide() && column.id !== 'acciones')
                                .map((column) => {
                                    const label =
                                        typeof column.columnDef.header === 'string'
                                            ? column.columnDef.header
                                            : column.id;
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {label}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {actionButton && <div>{actionButton}</div>}
                </div>
            </div>

            {bulkActions && table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-line bg-tint px-4 py-2.5">
                    <span className="text-[12.5px] font-semibold text-ink">
                        {table.getFilteredSelectedRowModel().rows.length} seleccionado(s)
                    </span>
                    <div className="flex items-center gap-2">
                        {bulkActions(
                            table.getFilteredSelectedRowModel().rows.map((row) => row.original),
                            () => table.resetRowSelection(),
                        )}
                    </div>
                </div>
            )}

            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const meta = header.column.columnDef.meta as { className?: string } | undefined;
                                return (
                                    <TableHead key={header.id} colSpan={header.colSpan} className={meta?.className}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={tableColumns.length} className="h-24 text-center text-muted">
                                Cargando...
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                            >
                                {row.getVisibleCells().map((cell) => {
                                    const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                                    return (
                                        <TableCell key={cell.id} className={meta?.className}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={tableColumns.length} className="h-24 text-center text-muted">
                                No se encontraron resultados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            
            <DataTablePagination 
                table={table} 
                onPageChange={onPageChange} 
            />
        </div>
    );
}
