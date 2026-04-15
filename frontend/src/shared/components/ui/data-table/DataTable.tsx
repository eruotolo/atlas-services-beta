'use client';

import type React from 'react';

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
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {title}
                        {totalCount !== undefined && ` (${totalCount})`}
                    </h2>
                )}
                <div className="flex gap-4">
                    {onSearchChange && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 py-3 pr-4 pl-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10 dark:bg-gray-900/40 dark:text-white"
                            />
                            <svg
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <title>Buscar</title>
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
                    )}
                    {actionButton}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-xl">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 uppercase dark:border-white/5 dark:bg-gray-800/50 dark:text-gray-400">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.accessorKey?.toString() || column.header}
                                    className={`px-6 py-4 ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/5 dark:bg-transparent">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="bg-white py-12 text-center text-gray-500 dark:bg-transparent dark:text-gray-500"
                                >
                                    Cargando...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="bg-white py-12 text-center text-gray-500 dark:bg-transparent dark:text-gray-500"
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
                                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Página {currentPage} de {pageCount}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pageCount}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
