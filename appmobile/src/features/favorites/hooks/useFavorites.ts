import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, getFavoriteIds } from '../actions/queries';
import { addFavorite, removeFavorite, checkFavorite } from '../actions/mutations';

export function useFavorites() {
    return useQuery({
        queryKey: ['favorites'],
        queryFn: getFavorites,
    });
}

export function useFavoriteIds() {
    return useQuery({
        queryKey: ['favorites', 'ids'],
        queryFn: getFavoriteIds,
    });
}

export function useIsFavorite(serviceId: string) {
    return useQuery({
        queryKey: ['favorites', 'check', serviceId],
        queryFn: () => checkFavorite(serviceId),
        enabled: !!serviceId,
    });
}

export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ serviceId, isCurrentlyFavorite }: { serviceId: string; isCurrentlyFavorite: boolean }) => {
            if (isCurrentlyFavorite) {
                await removeFavorite(serviceId);
            } else {
                await addFavorite(serviceId);
            }
            return { serviceId, isCurrentlyFavorite };
        },
        onMutate: async ({ serviceId, isCurrentlyFavorite }) => {
            await queryClient.cancelQueries({ queryKey: ['favorites'] });
            await queryClient.cancelQueries({ queryKey: ['favorites', 'ids'] });
            
            // Snapshot the previous value
            const previousIds = queryClient.getQueryData<string[]>(['favorites', 'ids']);
            
            // Optimistically update
            queryClient.setQueryData<string[]>(['favorites', 'ids'], (old = []) => {
                if (isCurrentlyFavorite) return old.filter(id => id !== serviceId);
                return [...old, serviceId];
            });

            return { previousIds };
        },
        onError: (err, variables, context) => {
            if (context?.previousIds) {
                queryClient.setQueryData(['favorites', 'ids'], context.previousIds);
            }
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            queryClient.invalidateQueries({ queryKey: ['favorites', 'ids'] });
            queryClient.invalidateQueries({ queryKey: ['favorites', 'check', variables.serviceId] });
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
}
