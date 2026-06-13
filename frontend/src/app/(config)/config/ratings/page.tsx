import { CountryScopeSelector } from '@/features/admin/components/CountryScopeSelector';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { getTodasCalificaciones } from '@/features/reviews/actions';
import CalificacionesTable from '@/features/reviews/components/admin/CalificacionesTable';

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ page?: string; q?: string; country?: string }>;
};

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigCalificacionesPage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';
    const country = sp.country || 'cl';

    const [result, countries] = await Promise.all([
        getTodasCalificaciones(page, 9, search, country),
        getAdminCountries(),
    ]);

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Gestión de Calificaciones</SectionLabel>
                <p className="mt-1 text-sm text-sub">Modera las reseñas y calificaciones dejadas por los usuarios a los servicios.</p>
            </div>

            <CountryScopeSelector
                countries={countries}
                defaultCode={country}
                subtitle="Filtra las calificaciones por el país seleccionado"
            >
                <div className="mt-6 rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                    <CalificacionesTable result={result} />
                </div>
            </CountryScopeSelector>
        </div>
    );
}
