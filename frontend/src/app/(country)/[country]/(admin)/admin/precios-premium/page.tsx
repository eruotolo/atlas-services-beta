import { getAdminPreciosPremium } from '@/features/payments/actions';
import PreciosPremiumTable from '@/features/payments/premium/components/PreciosPremiumTable';
import { PageHeader } from '@/shared/components/hireeo';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function PreciosPremiumPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const result = await getAdminPreciosPremium(page, 9, search, country);

    return (
        <>
            <PageHeader
                breadcrumb={['Admin', 'Precios Premium']}
                title="Precios Premium"
                subtitle="Configura los planes y precios de la suscripción Pro."
            />
            <div style={{ padding: 28 }}>
                <PreciosPremiumTable result={result} />
            </div>
        </>
    );
}
