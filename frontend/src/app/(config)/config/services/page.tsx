import { CountryScopeSelector } from '@/features/admin/components/CountryScopeSelector';
import { getAdminCategorias } from '@/features/categories/actions';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { getAdminServices } from '@/features/services/actions';
import ServiciosTable from '@/features/services/components/admin/ServiciosTable';
import { getUsersAll } from '@/features/users/actions';

type Props = {
    searchParams: Promise<{ page?: string; q?: string; country?: string }>;
};

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigServiciosPage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';
    const country = sp.country || 'cl';

    const [result, usuarios, categoriasResult, countries] = await Promise.all([
        getAdminServices(page, 9, search, country),
        getUsersAll(),
        getAdminCategorias(1, 100),
        getAdminCountries(),
    ]);

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Gestión de Servicios</SectionLabel>
                <p className="mt-1 text-sm text-sub">Administra y modera los servicios publicados en la plataforma.</p>
            </div>
            
            <CountryScopeSelector
                countries={countries}
                defaultCode={country}
                subtitle="Filtra los resultados por el país seleccionado"
            >
                <div className="mt-6 rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                    <ServiciosTable
                        result={result}
                        usuarios={usuarios}
                        categorias={categoriasResult.data}
                        countries={countries}
                    />
                </div>
            </CountryScopeSelector>
        </div>
    );
}
