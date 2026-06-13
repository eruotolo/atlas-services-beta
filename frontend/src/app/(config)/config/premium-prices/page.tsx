import { getAdminPreciosPorDuracion } from '@/features/payments/actions';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import PreciosPorDuracion from '@/features/payments/premium/components/PreciosPorDuracion';

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigPreciosPremiumPage() {
    const [{ byDuration }, countries] = await Promise.all([
        getAdminPreciosPorDuracion(),
        getAdminCountries(),
    ]);

    // byDuration solo contiene entradas con precios; ordenar por duración
    const groups = [...byDuration.entries()]
        .map(([duracionMeses, precios]) => ({ duracionMeses, precios }))
        .sort((a, b) => a.duracionMeses - b.duracionMeses);

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Precios de Planes Premium</SectionLabel>
                <p className="mt-1 text-sm text-sub">Configura el costo de las suscripciones premium por duración y país.</p>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                <PreciosPorDuracion groups={groups} countries={countries} />
            </div>
        </div>
    );
}
