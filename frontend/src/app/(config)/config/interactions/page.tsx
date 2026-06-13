import { CountryScopeSelector } from '@/features/admin/components/CountryScopeSelector';
import { getInteracciones, getInteraccionesMetricas } from '@/features/analytics/actions';
import InteraccionesTable from '@/features/analytics/components/admin/InteraccionesTable';
import { TopServiciosPanel } from '@/features/analytics/components/TopServiciosPanel';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { Stat } from '@/shared/components/hireeo';

type Props = {
    searchParams: Promise<{ page?: string; q?: string; country?: string }>;
};

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigInteraccionesPage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';
    const country = sp.country || 'cl';

    const [report, result, countries] = await Promise.all([
        getInteraccionesMetricas(country),
        getInteracciones(page, 12, search, country),
        getAdminCountries(),
    ]);

    if ('error' in report) {
        return (
            <div className="p-7 text-center text-red-500">
                Error al cargar las métricas: {String(report.error)}
            </div>
        );
    }

    const { porTipo, topServicios } = report;

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Métricas e Interacciones</SectionLabel>
                <p className="mt-1 text-sm text-sub">Analiza cómo los usuarios interactúan con los servicios de la plataforma.</p>
            </div>

            <CountryScopeSelector
                countries={countries}
                defaultCode={country}
                subtitle="Mostrando analíticas del país seleccionado"
            >
                <div className="mt-6 flex flex-col gap-8">
                    {/* Row 1: Metrics */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-item">
                        <Stat
                            label="Teléfonos Vistos"
                            value={(porTipo.VER_TELEFONO || 0).toLocaleString()}
                            icon="eye"
                        />
                        <Stat
                            label="Emails Vistos"
                            value={(porTipo.VER_EMAIL || 0).toLocaleString()}
                            icon="mail"
                        />
                        <Stat
                            label="Intentos Llamada"
                            value={(porTipo.LLAMAR || 0).toLocaleString()}
                            icon="phone"
                        />
                        <Stat
                            label="Clicks WhatsApp"
                            value={(porTipo.WHATSAPP || 0).toLocaleString()}
                            icon="chat"
                        />
                    </div>

                    {/* Row 2: Table & Top Services */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 stagger-item">
                        <div className="rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40 lg:col-span-8">
                            <InteraccionesTable result={result} />
                        </div>
                        <div className="rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40 lg:col-span-4">
                            <TopServiciosPanel topServicios={topServicios} />
                        </div>
                    </div>
                </div>
            </CountryScopeSelector>
        </div>
    );
}
