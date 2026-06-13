import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Calcula el monto real recibido descontando la comisión de MercadoPago (Link de pago)
 * Tasa: 3.19% + IVA
 */
export function calcularIngresoNeto(montoCobrado: number): number {
    const tasaMP = 0.0319; // 3.19% (Link de pago / Web)
    const iva = 0.19; // IVA en Chile

    // 1. Calculamos la comisión neta
    const comisionBase = montoCobrado * tasaMP;

    // 2. Le sumamos el IVA a esa comisión
    const costoTotal = comisionBase * (1 + iva);

    // 3. Restamos del cobro original y redondeamos hacia abajo
    const recibido = Math.floor(montoCobrado - costoTotal);

    return recibido;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount);
}

export function getCleanPhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
