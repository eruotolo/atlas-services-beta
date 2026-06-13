import { CountryScopeSelector } from '@/features/admin/components/CountryScopeSelector';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { getHistorialPagos } from '@/features/payments/actions';
import PagosTable from '@/features/payments/components/admin/PagosTable';

type Props = {
    searchParams: Promise<{
        page?: string;
        startDate?: string;
        endDate?: string;
        country?: string;
    }>;
};

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigPagosPage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const startDate = sp.startDate || undefined;
    const endDate = sp.endDate || undefined;

    // Solo países con pagos habilitados (config/countries → paymentsEnabled)
    const allCountries = await getAdminCountries();
    const countries = allCountries.filter((c) => c.paymentsEnabled);

    const country = countries.some((c) => c.code === sp.country)
        ? (sp.country as string)
        : (countries[0]?.code ?? 'cl');

    const result = await getHistorialPagos(page, 5, startDate, endDate, country);

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Historial de Pagos</SectionLabel>
                <p className="mt-1 text-sm text-sub">Revisa el registro de pagos, transacciones premium y su estado.</p>
            </div>

            <CountryScopeSelector
                countries={countries}
                defaultCode={country}
                subtitle="Mostrando pagos del país seleccionado (solo países con pagos habilitados)"
            >
                <div className="mt-6 rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                    <PagosTable result={result} countryCode={country} />
                </div>
            </CountryScopeSelector>
        </div>
    );
}
