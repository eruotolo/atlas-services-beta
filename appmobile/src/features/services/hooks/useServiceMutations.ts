import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createService, updateService, deleteService, toggleServiceActive } from '../actions/mutations';

export function useCreateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createService,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['services'] });
                queryClient.invalidateQueries({ queryKey: ['my-services'] });
            }
        },
    });
}

export function useUpdateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateService,
        onSuccess: (data, variables) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['services'] });
                queryClient.invalidateQueries({ queryKey: ['service', variables.id] });
                queryClient.invalidateQueries({ queryKey: ['my-services'] });
            }
        },
    });
}

export function useDeleteService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteService,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['services'] });
                queryClient.invalidateQueries({ queryKey: ['my-services'] });
            }
        },
    });
}

export function useToggleServiceActive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleServiceActive,
        onSuccess: (data, id) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['services'] });
                queryClient.invalidateQueries({ queryKey: ['service', id] });
                queryClient.invalidateQueries({ queryKey: ['my-services'] });
            }
        },
    });
}
