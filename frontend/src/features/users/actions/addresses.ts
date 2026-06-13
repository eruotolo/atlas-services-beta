'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

export interface AddressData {
    alias?: string;
    street: string;
    number: string;
    apartment?: string;
    zipCode?: string;
    reference?: string;
    isDefault?: boolean;
    countryId: string;
    regionId: string;
    localityId: string;
    latitude?: number;
    longitude?: number;
}

export interface UserAddress extends AddressData {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    country: { id: string; code: string; name: string };
    region: { id: string; code: string; name: string };
    locality: { id: string; slug: string; name: string };
}

export async function getUserAddresses(userId: string) {
    try {
        const token = await getAuthToken();
        if (!token) return [];

        const addresses = await apiClient.get<UserAddress[]>(`/users/${userId}/addresses`, {
            token,
            revalidate: 0,
        });
        return addresses || [];
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        return [];
    }
}

export async function createUserAddress(userId: string, data: AddressData) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'No autorizado' };

        await apiClient.post(`/users/${userId}/addresses`, data, {
            token,
        });

        revalidatePath('/config/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating address:', error);
        return { error: error.message || 'Error al crear la dirección' };
    }
}

export async function updateUserAddress(userId: string, addressId: string, data: Partial<AddressData>) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'No autorizado' };

        await apiClient.patch(`/users/${userId}/addresses/${addressId}`, data, {
            token,
        });

        revalidatePath('/config/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating address:', error);
        return { error: error.message || 'Error al actualizar la dirección' };
    }
}

export async function deleteUserAddress(userId: string, addressId: string) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'No autorizado' };

        await apiClient.delete(`/users/${userId}/addresses/${addressId}`, {
            token,
        });

        revalidatePath('/config/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting address:', error);
        return { error: error.message || 'Error al eliminar la dirección' };
    }
}
