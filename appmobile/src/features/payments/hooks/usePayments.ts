import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivePremiumPrices, getPaymentHistory } from '../actions/queries';
import { createPremiumPayment } from '../actions/mutations';
import { useCountry } from '@/features/country/context/CountryContext';

export function usePremiumPrices() {
    const { countryCode } = useCountry();

    return useQuery({
        queryKey: ['premium-prices', countryCode],
        queryFn: () => getActivePremiumPrices(countryCode),
        enabled: !!countryCode,
    });
}

export function usePaymentHistory(page = 1, limit = 10) {
    return useQuery({
        queryKey: ['payment-history', page, limit],
        queryFn: () => getPaymentHistory({ page, limit }),
    });
}

export function useCreatePremiumPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPremiumPayment,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['payment-history'] });
            }
        },
    });
}
