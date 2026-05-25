'use client';

import { useCountry } from '@/lib/providers/CountryProvider';

import { PaymentBrickMP } from './PaymentBrickMP';
import { PaymentBrickStripe } from './PaymentBrickStripe';

interface PaymentRouterProps {
    serviceId: string;
    durationMonths: number;
    amount: number;
    description: string;
}

export function PaymentRouter(props: PaymentRouterProps) {
    const country = useCountry();

    if (country.gateway === 'MERCADOPAGO') {
        return (
            <PaymentBrickMP
                servicioId={props.serviceId}
                duracionMeses={props.durationMonths}
                precio={props.amount}
                currency={country.currency}
                countryCode={country.code}
                onSuccess={() => undefined}
                onCancel={() => undefined}
            />
        );
    }

    return (
        <PaymentBrickStripe
            serviceId={props.serviceId}
            durationMonths={props.durationMonths}
            amount={props.amount}
            currency={country.currency}
            countryCode={country.code}
            description={props.description}
        />
    );
}
