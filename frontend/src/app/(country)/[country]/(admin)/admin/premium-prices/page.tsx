import { getAdminPreciosPremium } from '@/features/payments/actions';
import { getCountriesActivos } from '@/features/payments/actions';
import PreciosPremiumTable from '@/features/payments/premium/components/PreciosPremiumTable';
import { PageHeader } from '@/shared/components/hireeo';
import { getDictionary } from '@/lib/i18n/getDictionary';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function PreciosPremiumPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const dictionary = await getDictionary(country);
    const dict = dictionary.admin.sidebar;

    const [result, countries] = await Promise.all([
        getAdminPreciosPremium(page, 9, search, country),
        getCountriesActivos(),
    ]);

    return (
        <>
            <PageHeader
                breadcrumb={[dict.overview || 'Admin', dict.prices || 'Precios Premium']}
                title={dict.prices || 'Precios Premium'}
                subtitle="Configura los planes y precios de la suscripción Pro."
            />
            <div style={{ padding: 28 }}>
                <PreciosPremiumTable result={result} countries={countries} />
            </div>
        </>
    );
}
