'use client';

import { useMemo, useState } from 'react';

import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    DollarSign,
    TrendingUp,
} from 'lucide-react';

import { Pill } from '@/shared/components/hireeo';
import { calcularIngresoNeto } from '@/shared/lib/utils';

interface Pago {
    id: string;
    servicioId: string;
    duracionMeses: number;
    monto: number;
    metodoPago: string | null;
    estadoPago: string;
    fechaInicio: Date;
    fechaFin: Date;
    activa: boolean;
    createdAt: Date;
    servicio: {
        titulo: string;
        usuario: {
            nombre: string;
            email: string;
        };
        categoria: {
            nombre: string;
        };
    };
}

interface PagosTableProps {
    pagos: Pago[];
}

export default function PagosTable({ pagos }: PagosTableProps) {
    // Default to first day of current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const filteredPagos = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Adjust end date to include the whole day
        end.setHours(23, 59, 59, 999);

        return pagos.filter((p) => {
            const pagoDate = new Date(p.createdAt);
            return pagoDate >= start && pagoDate <= end;
        });
    }, [pagos, startDate, endDate]);

    const stats = useMemo(() => {
        return filteredPagos.reduce(
            (acc, curr) => {
                if (curr.estadoPago === 'completado') {
                    acc.ingresosBrutos += curr.monto;
                    acc.ingresosNetos += calcularIngresoNeto(curr.monto);
                    acc.completados++;
                } else if (curr.estadoPago === 'pendiente') {
                    acc.pendientes++;
                    acc.montoPendiente += curr.monto;
                }
                acc.total++;
                return acc;
            },
            {
                ingresosBrutos: 0,
                ingresosNetos: 0,
                pendientes: 0,
                completados: 0,
                total: 0,
                montoPendiente: 0,
            },
        );
    }, [filteredPagos]);

    const totalPages = Math.ceil(filteredPagos.length / ITEMS_PER_PAGE);
    const paginatedPagos = filteredPagos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount);
    };

    return (
        <div className="space-y-8 transition-colors duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-[2rem] border border-line bg-bg p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <p className="text-xs font-black tracking-widest text-muted uppercase">
                        Ingresos Reales (Caja)
                    </p>
                    <h4 className="mt-1 text-2xl font-black text-ink">
                        {formatCurrency(stats.ingresosNetos)}
                    </h4>
                    <p className="mt-2 text-xs font-medium text-green-600">
                        Cobrado: {formatCurrency(stats.ingresosBrutos)}
                    </p>
                </div>

                <div className="rounded-[2rem] border border-line bg-bg p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-xs font-black tracking-widest text-muted uppercase">
                        Transacciones
                    </p>
                    <h4 className="mt-1 text-2xl font-black text-ink">
                        {filteredPagos.length}
                    </h4>
                    <p className="mt-2 text-xs font-medium text-muted">
                        En el periodo seleccionado
                    </p>
                </div>

                <div className="rounded-[2rem] border border-line bg-bg p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <CreditCard size={24} />
                    </div>
                    <p className="text-xs font-black tracking-widest text-muted uppercase">
                        Por Cobrar / Pendiente
                    </p>
                    <h4 className="mt-1 text-2xl font-black text-ink">
                        {formatCurrency(stats.montoPendiente)}
                    </h4>
                    <p className="mt-2 text-xs font-medium text-amber-600">
                        {stats.pendientes} pagos pendientes
                    </p>
                </div>
            </div>

            {/* Filters & Table */}
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
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-transparent text-sm font-medium text-sub outline-none"
                            />
                            <span className="text-muted">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-transparent text-sm font-medium text-sub outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="overflow-x-auto rounded-3xl border border-line bg-bg shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line bg-tint text-xs text-muted uppercase">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Cliente / Servicio</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Cobrado</th>
                                    <th className="px-6 py-4">Neto (Caja)</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Método</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line bg-bg">
                                {paginatedPagos.map((pago) => (
                                    <tr
                                        key={pago.id}
                                        className="transition-colors hover:bg-tint"
                                    >
                                        <td className="px-6 py-4 text-muted">
                                            {new Date(pago.createdAt).toLocaleDateString()}
                                            <br />
                                            <span className="text-[10px]" suppressHydrationWarning>
                                                {new Date(pago.createdAt).toLocaleTimeString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-ink">
                                                    {pago.servicio.usuario.nombre}
                                                </p>
                                                <p className="text-xs text-muted">
                                                    {pago.servicio.titulo}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sub">
                                            Premium {pago.duracionMeses}m
                                        </td>
                                        <td className="px-6 py-4 font-medium text-sub">
                                            {formatCurrency(pago.monto)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-ink">
                                            {formatCurrency(calcularIngresoNeto(pago.monto))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Pill
                                                tone={
                                                    pago.estadoPago === 'completado'
                                                        ? 'success'
                                                        : pago.estadoPago === 'pendiente'
                                                          ? 'warning'
                                                          : 'danger'
                                                }
                                            >
                                                {pago.estadoPago.charAt(0).toUpperCase() +
                                                    pago.estadoPago.slice(1)}
                                            </Pill>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted capitalize">
                                            {pago.metodoPago || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPagos.length === 0 && (
                            <div className="py-12 text-center text-muted">
                                No se encontraron movimientos en este periodo
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-line pt-4">
                            <p className="text-sm text-muted">
                                Mostrando{' '}
                                <span className="font-bold text-sub">
                                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                </span>{' '}
                                a{' '}
                                <span className="font-bold text-sub">
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredPagos.length)}
                                </span>{' '}
                                de{' '}
                                <span className="font-bold text-sub">
                                    {filteredPagos.length}
                                </span>{' '}
                                resultados
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="cursor-pointer rounded-xl border border-line p-2 hover:bg-tint disabled:opacity-50"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-bold text-sub">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                    disabled={currentPage === totalPages}
                                    className="cursor-pointer rounded-xl border border-line p-2 hover:bg-tint disabled:opacity-50"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
