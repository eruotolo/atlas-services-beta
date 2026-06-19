'use client';

import { sileo } from 'sileo';
import type { SileoOptions } from 'sileo';

const POS = 'bottom-right' as const;

// Colores del sistema definidos en globals.css
const FILL = {
    success: '#e6f8ee',  // --success-soft
    error:   '#fce9e9',  // --danger-soft
    warning: '#fdf4e1',  // --warning-soft
    info:    '#e6eefa',  // --accent-soft
} as const;

/**
 * Centralized CRUD notifications via Sileo.
 * Backgrounds use the "soft" system color tokens from globals.css.
 * Text/icon colors are overridden via --sileo-state-* in globals.css.
 *
 * @example
 * formNotify.created('Categoría')
 * formNotify.updated()
 * formNotify.deleted('Usuario eliminado')
 * formNotify.error('El email ya está en uso')
 * formNotify.warning('Sin cambios', 'No se modificó ningún campo')
 */
export const formNotify = {
    // ── Create / Update / Delete ──────────────────────────────────────
    created: (description?: string): void =>
        void sileo.success({ position: POS, fill: FILL.success, title: 'Creado exitosamente', description }),

    updated: (description?: string): void =>
        void sileo.success({ position: POS, fill: FILL.success, title: 'Actualizado exitosamente', description }),

    deleted: (description?: string): void =>
        void sileo.success({ position: POS, fill: FILL.success, title: 'Eliminado exitosamente', description }),

    // ── Error / Warning / Info ────────────────────────────────────────
    error: (description: string): void =>
        void sileo.error({ position: POS, fill: FILL.error, title: 'Error', description }),

    warning: (title: string, description?: string): void =>
        void sileo.warning({ position: POS, fill: FILL.warning, title, description }),

    info: (title: string, description?: string): void =>
        void sileo.info({ position: POS, fill: FILL.info, title, description }),
};
