import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAvailableLeads, getMySentQuotes, submitQuote } from '../actions/leads';

export function useAvailableLeads() {
    return useQuery({
        queryKey: ['leads', 'available'],
        queryFn: getAvailableLeads,
    });
}

export function useSentQuotes() {
    return useQuery({
        queryKey: ['quotes', 'sent'],
        queryFn: getMySentQuotes,
    });
}

export function useSubmitQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: submitQuote,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['leads', 'available'] });
                queryClient.invalidateQueries({ queryKey: ['quotes', 'sent'] });
            }
        },
    });
}
