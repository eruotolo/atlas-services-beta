'use client';

import { sileo } from 'sileo';

interface NotifyOptions {
    title: string;
    description?: string;
}

/**
 * Wrapper único sobre Sileo (https://sileo.aaryan.design/).
 * Toda notificación en pantalla pasa por aquí — no importar `sileo` directamente.
 */
export const notify = {
    success: (options: NotifyOptions): void => {
        sileo.success(options);
    },
    error: (options: NotifyOptions): void => {
        sileo.error(options);
    },
    warning: (options: NotifyOptions): void => {
        sileo.warning(options);
    },
    info: (options: NotifyOptions): void => {
        sileo.info(options);
    },
};
