import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview, updateReview, deleteReview, replyReview } from '../actions/mutations';

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReview,
        onSuccess: (data, variables) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['service', variables.servicioId] });
            }
        },
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateReview,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['service'] });
            }
        },
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteReview,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['service'] });
            }
        },
    });
}

export function useReplyReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ serviceId, ratingId, respuesta }: { serviceId: string, ratingId: string, respuesta: string }) => 
            replyReview(serviceId, ratingId, respuesta),
        onSuccess: (data, variables) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
            }
        },
    });
}
