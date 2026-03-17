'use server';

import { getServerSession } from 'next-auth';

import { apiClient } from '@/lib/api/apiClient';
import type { BackendInteractionDto } from '@/lib/api/backendTypes';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function registrarInteraccion(servicioId: string, tipo: string) {
    try {
        const session = await getServerSession(authOptions);

        const payload: BackendInteractionDto = {
            serviceId: servicioId,
            type: tipo,
            userId: session?.user?.id,
        };

        await apiClient.post('/interactions', payload, {
            token: session?.user?.backendToken,
        });

        return { success: true };
    } catch (error) {
        console.error('Error registrando interacción:', error);
        return { success: false };
    }
}
