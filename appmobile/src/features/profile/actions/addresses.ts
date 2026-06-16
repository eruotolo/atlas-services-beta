import { apiClient } from '@/shared/lib/apiClient';

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

export async function getUserAddresses(): Promise<readonly UserAddress[]> {
    // Uses the authenticated user's token implicitly via apiClient
    // The backend uses `/users/me/addresses` for current user
    return apiClient.get<readonly UserAddress[]>('/users/me/addresses');
}

export async function createUserAddress(data: AddressData): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.post('/users/me/addresses', data);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al crear la dirección' };
    }
}

export async function updateUserAddress(addressId: string, data: Partial<AddressData>): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.patch(`/users/me/addresses/${addressId}`, data);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al actualizar la dirección' };
    }
}

export async function deleteUserAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.delete(`/users/me/addresses/${addressId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al eliminar la dirección' };
    }
}
