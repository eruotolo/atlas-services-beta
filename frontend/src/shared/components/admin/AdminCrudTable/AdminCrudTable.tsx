'use client';

import { useState, type ReactNode } from 'react';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { Btn, Icon } from '@/shared/components/hireeo';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/Dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';

const DEFAULT_PAGE_SIZE = 10;

interface AdminCrudTableProps<T extends { id: string }> {
    data: T[];
    columns: ColumnDef<T>[];
    title?: string;
    createLabel?: string;
    createTitle?: string;
    editTitle?: string;
    searchPlaceholder?: string;
    renderCreateForm: (onSuccess: () => void, onCancel: () => void) => ReactNode;
    renderEditForm: (item: T, onSuccess: () => void, onCancel: () => void) => ReactNode;
    extraRowActions?: (item: T) => ReactNode;
    bulkActions?: (selectedRows: T[], clearSelection: () => void) => ReactNode;
    onSuccess?: () => void;
    pageSize?: number;
}

export default function AdminCrudTable<T extends { id: string }>({
    data,
    columns,
    title,
    createLabel = 'Nuevo registro',
    createTitle = 'Crear registro',
    editTitle = 'Editar registro',
    searchPlaceholder = 'Buscar...',
    renderCreateForm,
    renderEditForm,
    extraRowActions,
    bulkActions,
    onSuccess,
    pageSize = DEFAULT_PAGE_SIZE,
}: AdminCrudTableProps<T>) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<T | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    const filtered = search
        ? data.filter((item) =>
              Object.values(item as Record<string, unknown>).some((v) =>
                  String(v).toLowerCase().includes(search.toLowerCase()),
              ),
          )
        : data;

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const activePage = Math.min(currentPage, pageCount);
    const paginated = filtered.slice((activePage - 1) * pageSize, activePage * pageSize);

    function handleSuccess() {
        setIsCreateOpen(false);
        setEditItem(null);
        onSuccess?.();
    }

    function handleSearchChange(value: string) {
        setSearch(value);
        setCurrentPage(1);
    }

    const actionsColumn: ColumnDef<T> = {
        header: 'Acciones',
        id: 'acciones',
        meta: { className: 'text-right' },
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Btn variant="ghost" className="h-11 w-11 p-0" size="sm">
                                <Icon name="more" size={20} />
                                <span className="sr-only">Abrir menú</span>
                            </Btn>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setEditItem(item)}>
                                <Icon name="edit" size={16} className="mr-2" />
                                Editar
                            </DropdownMenuItem>
                            {extraRowActions?.(item)}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    };

    return (
        <>
            <DataTable
                data={paginated}
                columns={[...columns, actionsColumn]}
                pageCount={pageCount}
                currentPage={activePage}
                onPageChange={setCurrentPage}
                title={title}
                totalCount={filtered.length}
                searchPlaceholder={searchPlaceholder}
                searchValue={search}
                onSearchChange={handleSearchChange}
                bulkActions={bulkActions}
                actionButton={
                    <Btn variant="primary" size="sm" className="h-[40px]" onClick={() => setIsCreateOpen(true)}>
                        <Icon name="plus" size={16} />
                        <span className="hidden sm:inline">{createLabel}</span>
                    </Btn>
                }
            />

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{createTitle}</DialogTitle>
                    </DialogHeader>
                    {renderCreateForm(handleSuccess, () => setIsCreateOpen(false))}
                </DialogContent>
            </Dialog>

            <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editTitle}</DialogTitle>
                    </DialogHeader>
                    {editItem !== null &&
                        renderEditForm(editItem, handleSuccess, () => setEditItem(null))}
                </DialogContent>
            </Dialog>
        </>
    );
}
