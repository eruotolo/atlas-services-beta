'use client';

import { useState } from 'react';

import type { Country } from '@/features/geo/types/geoTypes';
import type { PrecioPremium } from '@/features/payments/types/paymentTypes';
import { Edit2, Plus, Trash2 } from '@/shared/components/icons';
import Modal from '@/shared/components/admin/Modal';
import { Btn, Field, Pill, Select } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';

import { eliminarPrecioPremium, toggleActivoPrecioPremium } from '../actions';
import PrecioPremiumForm from './PrecioPremiumForm';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DuracionGroup {
    duracionMeses: number;
    precios: PrecioPremium[];
}

interface PreciosPorDuracionProps {
    groups: DuracionGroup[];
    countries: Country[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DURACION_LABELS: Record<number, string> = {
    1: '1 mes',
    3: '3 meses',
    6: '6 meses',
    9: '9 meses',
    12: '12 meses',
};

function formatPrice(precio: number, currency = 'CLP', locale = 'es-CL') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(precio);
}

function countryFlag(code: string) {
    // Convierte código de país a emoji de bandera
    return code
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
        .join('');
}

// ─── Componente de fila de país ────────────────────────────────────────────────

interface PrecioRowProps {
    precio: PrecioPremium;
    onEdit: (p: PrecioPremium) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    isDeleting: boolean;
}

function PrecioRow({ precio, onEdit, onDelete, onToggle, isDeleting }: PrecioRowProps) {
    const flag = precio.countryCode ? countryFlag(precio.countryCode) : '🌍';
    const label = precio.countryName ?? precio.countryCode ?? 'País';
    const currency = precio.currency ?? 'CLP';

    return (
        <div
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors"
            style={{ background: 'var(--tint)' }}
        >
            {/* País */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="text-xl leading-none">{flag}</span>
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
                        {label}
                    </p>
                    {precio.descripcion && (
                        <p className="truncate text-[11px]" style={{ color: 'var(--muted)' }}>
                            {precio.descripcion}
                        </p>
                    )}
                </div>
            </div>

            {/* Precio + moneda */}
            <div className="text-right">
                <p className="text-[15px] font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                    {formatPrice(precio.precio, currency)}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                    {currency}
                </p>
            </div>

            {/* Estado */}
            <button
                type="button"
                onClick={() => onToggle(precio.id)}
                className="cursor-pointer shrink-0 transition-all hover:scale-105"
                title={precio.activo ? 'Click para desactivar' : 'Click para activar'}
            >
                <Pill tone={precio.activo ? 'success' : 'default'}>
                    {precio.activo ? 'Activo' : 'Inactivo'}
                </Pill>
            </button>

            {/* Acciones */}
            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    onClick={() => onEdit(precio)}
                    className="cursor-pointer rounded-lg p-1.5 transition-colors"
                    style={{ color: 'var(--accent)' }}
                    title="Editar"
                >
                    <Edit2 size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(precio.id)}
                    disabled={isDeleting}
                    className="cursor-pointer rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                    title="Eliminar"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

// ─── Tarjeta de duración (accordion) ──────────────────────────────────────────

interface DuracionCardProps {
    group: DuracionGroup;
    countries: Country[];
    onEdit: (p: PrecioPremium) => void;
    onDelete: (id: string) => void;
    onDeleteGroup: (duracionMeses: number, precios: PrecioPremium[]) => void;
    onToggle: (id: string) => void;
    onAddCountry: (duracionMeses: number) => void;
    isDeleting: string | null;
    defaultOpen?: boolean;
}

function DuracionCard({
    group,
    countries,
    onEdit,
    onDelete,
    onDeleteGroup,
    onToggle,
    onAddCountry,
    isDeleting,
    defaultOpen = false,
}: DuracionCardProps) {
    const [open, setOpen] = useState(defaultOpen);
    const configured = group.precios.length;
    const total = countries.length;
    const allActive = group.precios.every((p) => p.activo);

    return (
        <div
            className="overflow-hidden rounded-2xl border transition-all"
            style={{
                borderColor: open ? 'var(--accent)' : 'var(--line)',
                background: 'var(--surface)',
            }}
        >
            {/* Header — click para expandir */}
            {/* biome-ignore lint/a11y/useSemanticElements: div en lugar de button porque contiene buttons internos (eliminar) */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v); }}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
                style={{ background: open ? 'var(--accent-soft)' : 'transparent' }}
            >
                <div className="flex items-center gap-4">
                    {/* Badge de duración */}
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-bold"
                        style={{
                            background: open ? 'var(--accent)' : 'var(--tint)',
                            color: open ? '#fff' : 'var(--ink)',
                        }}
                    >
                        {group.duracionMeses}m
                    </div>

                    <div>
                        <p className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
                            {DURACION_LABELS[group.duracionMeses] ?? `${group.duracionMeses} meses`}
                        </p>
                        <p className="text-[12px]" style={{ color: 'var(--sub)' }}>
                            {configured === 0
                                ? 'Sin precios configurados'
                                : `${configured} de ${total} ${total === 1 ? 'país' : 'países'} configurado${configured !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Indicadores de países configurados */}
                    {group.precios.slice(0, 5).map((p) => (
                        <span
                            key={p.id}
                            title={p.countryName ?? p.countryCode}
                            className="text-base leading-none"
                        >
                            {p.countryCode ? countryFlag(p.countryCode) : '🌍'}
                        </span>
                    ))}
                    {group.precios.length > 5 && (
                        <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                            +{group.precios.length - 5}
                        </span>
                    )}

                    <Pill tone={configured === 0 ? 'default' : allActive ? 'success' : 'warning'}>
                        {configured === 0 ? 'Ninguno activo' : allActive ? 'Todos activos' : 'Algunos inactivos'}
                    </Pill>

                    {/* Botón eliminar mes */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteGroup(group.duracionMeses, group.precios);
                        }}
                        className="cursor-pointer rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title={`Eliminar mes de ${DURACION_LABELS[group.duracionMeses] ?? `${group.duracionMeses} meses`}`}
                    >
                        <Trash2 size={15} />
                    </button>

                    {/* Chevron */}
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="shrink-0 transition-transform duration-200"
                        style={{
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: 'var(--muted)',
                        }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {/* Body expandible */}
            {open && (
                <div className="border-t px-5 py-5" style={{ borderColor: 'var(--line)' }}>
                    {group.precios.length === 0 ? (
                        <div
                            className="rounded-xl px-4 py-6 text-center text-[13px]"
                            style={{
                                background: 'var(--tint)',
                                color: 'var(--sub)',
                            }}
                        >
                            No hay precios configurados para este período.
                            <br />
                            Agrega un precio para comenzar.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {group.precios.map((precio) => (
                                <PrecioRow
                                    key={precio.id}
                                    precio={precio}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onToggle={onToggle}
                                    isDeleting={isDeleting === precio.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Botón agregar país */}
                    {configured < total && (
                        <button
                            type="button"
                            onClick={() => onAddCountry(group.duracionMeses)}
                            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-[12.5px] font-medium transition-colors"
                            style={{
                                borderColor: 'var(--accent)',
                                color: 'var(--accent)',
                            }}
                        >
                            <Plus size={14} />
                            Agregar país para {DURACION_LABELS[group.duracionMeses] ?? `${group.duracionMeses} meses`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Componente principal ──────────────────────────────────────────────────────

const DURACIONES_DISPONIBLES = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: i + 1 === 1 ? '1 mes' : `${i + 1} meses`,
}));

export default function PreciosPorDuracion({ groups, countries }: PreciosPorDuracionProps) {
    const [editModal, setEditModal] = useState<{
        open: boolean;
        precio?: PrecioPremium;
        duracionMeses?: number;
    }>({ open: false });
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [newPlanModal, setNewPlanModal] = useState(false);
    const [newPlanDuration, setNewPlanDuration] = useState('');
    const [draftDurations, setDraftDurations] = useState<Set<number>>(new Set());

    // Fusiona grupos reales (con precios) + borradores locales, ordenados por duración
    const existingDurations = new Set(groups.map((g) => g.duracionMeses));
    const allGroups = [
        ...groups,
        ...[...draftDurations]
            .filter((d) => !existingDurations.has(d))
            .map((d) => ({ duracionMeses: d, precios: [] as PrecioPremium[] })),
    ].sort((a, b) => a.duracionMeses - b.duracionMeses);

    // Duraciones que aún no existen (ni en DB ni como borrador)
    const takenDurations = new Set([...existingDurations, ...draftDurations]);
    const availableDurations = DURACIONES_DISPONIBLES.filter((d) => !takenDurations.has(d.value));

    function handleCreatePlan() {
        const dur = Number(newPlanDuration);
        if (!dur) return;
        setDraftDurations((prev) => new Set([...prev, dur]));
        setNewPlanModal(false);
        setNewPlanDuration('');
    }

    function handleEdit(precio: PrecioPremium) {
        setEditModal({ open: true, precio });
    }

    function handleAddCountry(duracionMeses: number) {
        setEditModal({ open: true, duracionMeses });
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Eliminar este precio? Esta acción no se puede deshacer.')) return;
        setIsDeleting(id);
        try {
            const result = await eliminarPrecioPremium(id);
            if (result.error) {
                notify.error({ title: 'Error al eliminar precio', description: result.error });
            } else {
                notify.success({ title: 'Precio eliminado' });
                window.location.reload();
            }
        } catch {
            notify.error({ title: 'Error al eliminar precio' });
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleDeleteGroup(duracionMeses: number, precios: PrecioPremium[]) {
        const label = DURACION_LABELS[duracionMeses] ?? `${duracionMeses} meses`;

        if (precios.length === 0) {
            // Borrador local — solo quitar del estado, sin llamada a DB
            setDraftDurations((prev) => {
                const next = new Set(prev);
                next.delete(duracionMeses);
                return next;
            });
            return;
        }

        if (!confirm(`¿Eliminar TODOS los precios de "${label}" (${precios.length} ${precios.length === 1 ? 'registro' : 'registros'})? Esta acción no se puede deshacer.`)) return;

        setIsDeleting('group');
        try {
            for (const precio of precios) {
                await eliminarPrecioPremium(precio.id);
            }
            notify.success({ title: 'Grupo de precios eliminado' });
            window.location.reload();
        } catch {
            notify.error({ title: 'Error al eliminar el grupo de precios' });
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleToggle(id: string) {
        try {
            const result = await toggleActivoPrecioPremium(id);
            if (result.error) {
                notify.error({ title: 'Error al cambiar estado', description: result.error });
            } else {
                notify.success({ title: 'Estado del precio actualizado' });
                window.location.reload();
            }
        } catch {
            notify.error({ title: 'Error al cambiar estado' });
        }
    }

    function handleSuccess() {
        setEditModal({ open: false });
        window.location.reload();
    }

    return (
        <>
            {/* Header con resumen y botón global */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
                        Precios Premium
                    </h2>
                    <p className="mt-0.5 text-[13px]" style={{ color: 'var(--sub)' }}>
                        {groups.length} {groups.length === 1 ? 'plan' : 'planes'} · {countries.length} {countries.length === 1 ? 'país' : 'países'} registrados
                    </p>
                </div>
                <Btn
                    type="button"
                    variant="primary"
                    onClick={() => setNewPlanModal(true)}
                    disabled={availableDurations.length === 0}
                >
                    <Plus size={16} />
                    Nuevo Plan
                </Btn>
            </div>

            {/* Tarjetas de duración */}
            <div className="flex flex-col gap-3">
                {allGroups.map((group) => (
                    <DuracionCard
                        key={group.duracionMeses}
                        group={group}
                        countries={countries}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDeleteGroup={handleDeleteGroup}
                        onToggle={handleToggle}
                        onAddCountry={handleAddCountry}
                        isDeleting={isDeleting}
                        defaultOpen={draftDurations.has(group.duracionMeses)}
                    />
                ))}
            </div>

            {/* Modal: seleccionar mes para nuevo plan */}
            <Modal
                isOpen={newPlanModal}
                onClose={() => { setNewPlanModal(false); setNewPlanDuration(''); }}
                title="Nuevo plan de duración"
            >
                <div className="space-y-5">
                    <Field label="Duración del plan">
                        <Select
                            value={newPlanDuration}
                            onChange={(e) => setNewPlanDuration(e.target.value)}
                        >
                            <option value="">Seleccionar duración…</option>
                            {availableDurations.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <div className="mt-8 flex justify-end gap-3">
                        <Btn
                            variant="secondary"
                            type="button"
                            onClick={() => { setNewPlanModal(false); setNewPlanDuration(''); }}
                        >
                            Cancelar
                        </Btn>
                        <Btn
                            variant="primary"
                            type="button"
                            onClick={handleCreatePlan}
                            disabled={!newPlanDuration}
                        >
                            Crear plan
                        </Btn>
                    </div>
                </div>
            </Modal>

            {/* Modal agregar país / editar precio */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false })}
                title={editModal.precio ? 'Editar Precio' : 'Agregar país'}
            >
                <PrecioPremiumForm
                    precioPremium={editModal.precio}
                    defaultDuracion={editModal.duracionMeses}
                    countries={countries}
                    onSuccess={handleSuccess}
                    onCancel={() => setEditModal({ open: false })}
                />
            </Modal>
        </>
    );
}
