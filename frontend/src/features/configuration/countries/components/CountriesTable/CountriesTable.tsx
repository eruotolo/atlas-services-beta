'use client';

import { useState } from 'react';

import { toggleActivoPais } from '@/features/configuration/countries/actions/mutations';
import CountryForm from '@/features/configuration/countries/components/CountryForm/CountryForm';
import type { Country } from '@/features/geo/types/geoTypes';
import AdminCrudTable from '@/shared/components/admin/AdminCrudTable/AdminCrudTable';
import { Btn, Icon, Pill } from '@/shared/components/hireeo';
import type { ColumnDef } from '@tanstack/react-table';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/shared/components/DropdownMenu';
import { notify } from '@/shared/lib/notify';

interface CountriesTableProps {
    countries: Country[];
}

const GATEWAY_LABEL: Record<string, string> = {
    MERCADOPAGO: 'MercadoPago',
    STRIPE: 'Stripe',
};

const columns: ColumnDef<Country>[] = [
    {
        header: 'Código',
        cell: ({ row: { original: c } }) => (
            <span className="font-mono text-xs font-bold text-ink uppercase">{c.code}</span>
        ),
    },
    {
        header: 'País',
        cell: ({ row: { original: c } }) => <span className="font-semibold text-ink">{c.name}</span>,
    },
    {
        header: 'Moneda',
        cell: ({ row: { original: c } }) => (
            <span className="font-mono text-xs text-sub">
                {c.currency} · {c.locale}
            </span>
        ),
    },
    {
        header: 'Pasarela',
        cell: ({ row: { original: c } }) => (
            <Pill tone={c.gateway === 'STRIPE' ? 'accent' : 'warning'}>
                {GATEWAY_LABEL[c.gateway] ?? c.gateway}
            </Pill>
        ),
    },
    {
        header: 'Pagos',
        cell: ({ row: { original: c } }) => (
            <Pill tone={c.paymentsEnabled ? 'success' : 'default'}>
                {c.paymentsEnabled ? 'Activo' : 'Inactivo'}
            </Pill>
        ),
    },
    {
        header: 'Estado',
        cell: ({ row: { original: c } }) => (
            <Pill tone={c.active ? 'success' : 'danger'}>{c.active ? 'Activo' : 'Desactivado'}</Pill>
        ),
    },
];

export default function CountriesTable({ countries }: CountriesTableProps) {
    const [toggling, setToggling] = useState<string | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    async function handleToggleActive(country: Country) {
        setToggling(country.code);
        try {
            const result = await toggleActivoPais(country.code, !country.active);
            if (result.error) {
                notify.error({ title: 'Error al cambiar estado', description: result.error });
            } else {
                notify.success({
                    title: country.active
                        ? `${country.name} desactivado`
                        : `${country.name} activado`,
                });
                window.location.reload();
            }
        } catch {
            notify.error({ title: 'Error al cambiar el estado del país' });
        } finally {
            setToggling(null);
        }
    }

    async function handleBulkToggle(selected: Country[], active: boolean) {
        setBulkLoading(true);
        try {
            const results = await Promise.all(
                selected
                    .filter((c) => c.active !== active)
                    .map((c) => toggleActivoPais(c.code, active)),
            );
            const failed = results.find((r) => r.error);
            if (failed?.error) {
                notify.error({ title: 'Error al actualizar países', description: failed.error });
            } else {
                notify.success({ title: 'Países actualizados' });
                window.location.reload();
            }
        } catch {
            notify.error({ title: 'Error al actualizar los países seleccionados' });
        } finally {
            setBulkLoading(false);
        }
    }

    return (
        <AdminCrudTable<Country>
            data={countries}
            columns={columns}
            createLabel="Nuevo País"
            createTitle="Crear Nuevo País"
            editTitle="Editar País"
            searchPlaceholder="Buscar país..."
            renderCreateForm={(onSuccess, onCancel) => (
                <CountryForm onSuccess={onSuccess} onCancel={onCancel} />
            )}
            renderEditForm={(item, onSuccess, onCancel) => (
                <CountryForm country={item} onSuccess={onSuccess} onCancel={onCancel} />
            )}
            extraRowActions={(country) => (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => handleToggleActive(country)}
                        disabled={toggling === country.code}
                        className={country.active ? 'text-danger' : 'text-success'}
                    >
                        <Icon name="zap" size={16} className="mr-2" />
                        {country.active ? 'Desactivar' : 'Activar'}
                    </DropdownMenuItem>
                </>
            )}
            bulkActions={(selected) => (
                <>
                    <Btn
                        variant="secondary"
                        size="sm"
                        disabled={bulkLoading}
                        onClick={() => handleBulkToggle(selected, true)}
                    >
                        Activar
                    </Btn>
                    <Btn
                        variant="secondary"
                        size="sm"
                        disabled={bulkLoading}
                        onClick={() => handleBulkToggle(selected, false)}
                    >
                        Desactivar
                    </Btn>
                </>
            )}
            onSuccess={() => window.location.reload()}
        />
    );
}
