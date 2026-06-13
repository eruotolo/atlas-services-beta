'use client';

import { useTransition } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Calendar, CreditCard, DollarSign, TrendingUp } from 'lucide-react';

import type { Column } from '@/shared/components/ui/data-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { Avatar, Pill } from '@/shared/components/hireeo';
import { calcularIngresoNeto } from '@/shared/lib/utils';

import type { SuscripcionWithDetails } from '../../types/paymentTypes';

interface PagosTableProps {
    result: {
        data: SuscripcionWithDetails[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            ingresosBrutos: number;
            pendientes: number;
            completados: number;
            total: number;
            montoPendiente: number;
        };
    };
}

export default function PagosTable({ result }: PagosTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentPage = Number(searchParams.get('page')) || 1;
    const startDate = searchParams.get('startDate') || getDefaultStartDate();
    const endDate = searchParams.get('endDate') || getDefaultEndDate();

    function getDefaultStartDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }

    function getDefaultEndDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    function updateSearchParams(params: Record<string, string | number>) {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                newSearchParams.set(key, String(value));
            } else {
                newSearchParams.delete(key);
            }
        });

        startTransition(() => {
            router.push(`${pathname}?${newSearchParams.toString()}`);
        });
    }

    function handlePageChange(page: number) {
        updateSearchParams({ page, startDate, endDate });
    }

    function handleDateChange(type: 'startDate' | 'endDate', value: string) {
        updateSearchParams({
            page: 1, // Reset a página 1 cuando cambian las fechas
            startDate: type === 'startDate' ? value : startDate,
            endDate: type === 'endDate' ? value : endDate,
        });
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount);
    };

    // Calcular ingreso neto total
    const ingresosNetos = calcularIngresoNeto(result.stats.ingresosBrutos);

    // Definir las columnas de la tabla
    const columns: Column<SuscripcionWithDetails>[] = [
        {
            header: 'Fecha',
            cell: (pago) => (
                <div className="text-muted">
                    {new Date(pago.createdAt).toLocaleDateString()}
                    <br />
                    <span className="text-[10px]" suppressHydrationWarning>
                        {new Date(pago.createdAt).toLocaleTimeString()}
                    </span>
                </div>
            ),
        },
        {
            header: 'Cliente / Servicio',
            cell: (pago) => (
                <div className="flex items-center gap-2.5">
                    <Avatar name={pago.servicio.usuario.nombre} size={28} />
                    <div>
                        <p className="font-bold text-ink">
                            {pago.servicio.usuario.nombre}
                        </p>
                        <p className="text-xs text-muted">
                            {pago.servicio.titulo}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Plan',
            cell: (pago) => (
                <span className="text-sub">
                    Premium {pago.duracionMeses}m
                </span>
            ),
        },
        {
            header: 'Cobrado',
            cell: (pago) => (
                <span className="font-medium text-sub">
                    {formatCurrency(Number(pago.monto))}
                </span>
            ),
        },
        {
            header: 'Neto (Caja)',
            cell: (pago) => (
                <span className="font-bold text-ink">
                    {formatCurrency(calcularIngresoNeto(Number(pago.monto)))}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: (pago) => (
                <Pill
                    tone={
                        pago.estadoPago === 'completado'
                            ? 'success'
                            : pago.estadoPago === 'pendiente'
                              ? 'warning'
                              : 'danger'
                    }
                >
                    {pago.estadoPago.charAt(0).toUpperCase() + pago.estadoPago.slice(1)}
                </Pill>
            ),
        },
        {
            header: 'Método',
            className: 'text-right',
            cell: (pago) => (
                <span className="text-muted capitalize">
                    {pago.metodoPago || '-'}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-8 transition-colors duration-300">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-line bg-bg p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <p className="text-xs font-black tracking-widest text-muted uppercase">
                        Ingresos Reales (Caja)
                    </p>
                    <h4 className="mt-1 text-2xl font-black text-ink">
                        {formatCurrency(ingresosNetos)}
                    </h4>
                    <p className="mt-2 text-xs font-medium text-green-600">
                        Cobrado: {formatCurrency(result.stats.ingresosBrutos)}
                    </p>
                </div>

                <div className="rounded-xl border border-line bg-bg p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-xs font-black tracking-widest text-muted uppercase">
                        Transacciones
                    </p>
                    <h4 className="mt-1 text-2xl font-black text-ink">
                        {result.stats.total}
                    </h4>
                    <p className="mt-2 text-xs font-medium text-muted">
                        En el periodo seleccionado
                    </p>
                </div>

                <div className="rounded-xl border border-line bg-bg p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <CreditCard size={24} />
                    </div>
                    <p className="text-xs font-black tracking-widest text-muted uppercase">
                        Por Cobrar / Pendiente
                    </p>
                    <h4 className="mt-1 text-2xl font-black text-ink">
                        {formatCurrency(result.stats.montoPendiente)}
                    </h4>
                    <p className="mt-2 text-xs font-medium text-amber-600">
                        {result.stats.pendientes} pagos pendientes
                    </p>
                </div>
            </div>

            {/* Tabla con filtros de fecha */}
            <div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-black text-ink">
                        Detalle de Movimientos
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 rounded-2xl border border-line bg-bg px-4 py-2 shadow-sm">
                            <Calendar size={16} className="text-muted" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                                className="bg-transparent text-sm font-medium text-sub outline-none"
                            />
                            <span className="text-line">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => handleDateChange('endDate', e.target.value)}
                                className="bg-transparent text-sm font-medium text-sub outline-none"
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    data={result.data}
                    columns={columns}
                    pageCount={result.meta.totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    isLoading={isPending}
                />
            </div>
        </div>
    );
}
