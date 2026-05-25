import { getAdminPreciosPremium } from '@/features/payments/actions';
import PreciosPremiumTable from '@/features/payments/premium/components/PreciosPremiumTable';

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
        <div>
            <PreciosPremiumTable result={result} />
        </div>
    );
}
