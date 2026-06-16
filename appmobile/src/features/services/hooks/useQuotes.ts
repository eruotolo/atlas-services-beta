import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyServiceRequests, getQuotesByRequest, acceptQuote } from '../actions/quotes';

export function useMyServiceRequests() {
    return useQuery({
        queryKey: ['service-requests', 'my-requests'],
        queryFn: getMyServiceRequests,
    });
}

export function useQuotesByRequest(serviceRequestId: string) {
    return useQuery({
        queryKey: ['quotes', 'by-request', serviceRequestId],
        queryFn: () => getQuotesByRequest(serviceRequestId),
        enabled: !!serviceRequestId,
    });
}

export function useAcceptQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: acceptQuote,
        onSuccess: (data, quoteId) => {
            if (data.success) {
                // Invalidate quotes to refresh the accepted status
                queryClient.invalidateQueries({ queryKey: ['quotes'] });
                queryClient.invalidateQueries({ queryKey: ['service-requests'] });
            }
        },
    });
}
