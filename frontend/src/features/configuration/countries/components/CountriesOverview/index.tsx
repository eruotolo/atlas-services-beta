import type { ReactElement } from 'react';

import type { Country } from '@/features/geo/types/geoTypes';
import { Icon, Mono, Pill } from '@/shared/components/hireeo';

const GATEWAY_LABEL: Record<string, string> = {
    MERCADOPAGO: 'MercadoPago',
    STRIPE: 'Stripe',
};

interface CountriesOverviewProps {
    countries: Country[];
}

/** Vista resumida del estado de cada país de la plataforma (dashboard global). */
export function CountriesOverview({ countries }: CountriesOverviewProps): ReactElement {
    if (countries.length === 0) {
        return (
            <p className="rounded-xl border border-line bg-bg p-6 text-center text-sm text-muted">
                No hay países configurados.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {countries.map((country) => (
                <div
                    key={country.code}
                    className="rounded-xl border border-line bg-bg p-4 transition-shadow hover:shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <Mono className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                            {country.code}
                        </Mono>
                        <Pill tone={country.active ? 'success' : 'default'}>
                            {country.active ? 'Activo' : 'Inactivo'}
                        </Pill>
                    </div>
                    <div className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                        {country.name}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-sub">
                        {country.currency} · {country.locale}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                        <span className="text-[11px] text-sub">
                            {GATEWAY_LABEL[country.gateway] ?? country.gateway}
                        </span>
                        <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium"
                            style={{
                                color: country.paymentsEnabled ? 'var(--success)' : 'var(--muted)',
                            }}
                        >
                            <Icon name="card" size={11} />
                            {country.paymentsEnabled ? 'Pagos activos' : 'Sin pagos'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
