import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import CountriesTable from '@/features/configuration/countries/components/CountriesTable/CountriesTable';

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigPaisesPage() {
    const countries = await getAdminCountries();

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Gestión de Países</SectionLabel>
                <p className="mt-1 text-sm text-sub">Configura las opciones regionales, monedas y pasarelas de pago por país.</p>
            </div>
            
            <div className="mt-6 rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                <CountriesTable countries={countries} />
            </div>
        </div>
    );
}
