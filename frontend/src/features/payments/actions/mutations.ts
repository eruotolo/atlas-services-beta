'use server';

import { revalidatePath } from 'next/cache';

export async function procesarPagoWebhook(data: {
    paymentId: string;
    servicioId: string;
    duracionMeses: number;
    monto: number;
    paymentStatus: string;
}) {
    console.info('procesarPagoWebhook (stub):', data);
    return { success: true };
}

export async function crearPagoPremium(data: {
    servicioId: string;
    duracionMeses: number;
    paymentData: unknown;
}): Promise<{ success: boolean; error?: string }> {
    console.info('crearPagoPremium (stub):', data);
    revalidatePath('/profile');
    return { success: true };
}
