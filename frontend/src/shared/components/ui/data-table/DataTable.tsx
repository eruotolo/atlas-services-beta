'use client';

import type React from 'react';

import { Btn } from '@/shared/components/hireeo/Btn';
import { Input } from '@/shared/components/hireeo/Input';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];

    // Paginación
    pageCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;

    // Búsqueda (Opcional)
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;

    // Acciones Globales (Ej: Botón "Crear Nuevo")
    actionButton?: React.ReactNode;

    // Estado de carga
    isLoading?: boolean;

    // Título y contador
    title?: string;
    totalCount?: number;
}

export default function DataTable<T extends { id: string }>({
    data,
    columns,
    pageCount,
    currentPage,
    onPageChange,
    searchPlaceholder = 'Buscar...',
    searchValue = '',
    onSearchChange,
    actionButton,
    isLoading = false,
    title,
    totalCount,
}: DataTableProps<T>) {
    return (
        <div className="transition-colors duration-300">
            {/* Header con título, búsqueda y acciones */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {title && (
                    <h2 className="text-2xl font-black text-ink">
                        {title}
                        {totalCount !== undefined && ` (${totalCount})`}
                    </h2>
                )}
                <div className="flex items-center gap-3">
                    {onSearchChange && (
                        <div className="w-full sm:w-72">
                            <Input
                                icon="search"
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    )}
                    {actionButton}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-line bg-bg">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-tint font-mono text-[10.5px] tracking-[0.08em] text-sub uppercase">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.accessorKey?.toString() || column.header}
                                    className={`px-6 py-3 font-semibold ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-bg">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-12 text-center text-muted"
                                >
                                    Cargando...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-12 text-center text-muted"
                                >
                                    {searchValue
                                        ? 'No se encontraron resultados'
                                        : 'No hay registros disponibles'}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-line transition-colors hover:bg-tint"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.accessorKey?.toString() || column.header}
                                            className={`px-6 py-4 ${column.className || ''}`}
                                        >
                                            {column.cell
                                                ? column.cell(item)
                                                : column.accessorKey
                                                  ? String(item[column.accessorKey])
                                                  : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pageCount > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-sub">
                        Página {currentPage} de {pageCount}
                    </p>
                    <div className="flex gap-2">
                        <Btn
                            variant="secondary"
                            size="sm"
                            icon="arrowLeft"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Btn>
                        <Btn
                            variant="secondary"
                            size="sm"
                            iconRight="arrow"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pageCount}
                        >
                            Siguiente
                        </Btn>
                    </div>
                </div>
            )}
        </div>
    );
}
