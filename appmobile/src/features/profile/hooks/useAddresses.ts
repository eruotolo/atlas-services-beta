import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserAddresses, createUserAddress, updateUserAddress, deleteUserAddress } from '../actions/addresses';
import type { AddressData } from '../actions/addresses';

export function useAddresses() {
    return useQuery({
        queryKey: ['user-addresses'],
        queryFn: getUserAddresses,
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUserAddress,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
            }
        },
    });
}

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ addressId, data }: { addressId: string, data: Partial<AddressData> }) => updateUserAddress(addressId, data),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
            }
        },
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUserAddress,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
            }
        },
    });
}
