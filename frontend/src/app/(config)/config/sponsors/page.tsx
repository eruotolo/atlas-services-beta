import { CountryScopeSelector } from '@/features/admin/components/CountryScopeSelector';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { getTodasSponsors } from '@/features/sponsors/actions';
import SponsorsTable from '@/features/sponsors/components/admin/SponsorsTable';

type Props = {
    searchParams: Promise<{ page?: string; q?: string; country?: string }>;
};

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigSponsorsPage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';
    const country = sp.country || 'cl';

    const [result, countries] = await Promise.all([
        getTodasSponsors(page, 9, search, country),
        getAdminCountries(),
    ]);

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Gestión de Sponsors</SectionLabel>
                <p className="mt-1 text-sm text-sub">Administra las marcas patrocinadoras y sus banners promocionales.</p>
            </div>

            <CountryScopeSelector
                countries={countries}
                defaultCode={country}
                subtitle="Sponsors globales y específicos del país seleccionado"
            >
                <div className="mt-6 rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                    <SponsorsTable result={result} countries={countries} />
                </div>
            </CountryScopeSelector>
        </div>
    );
}
