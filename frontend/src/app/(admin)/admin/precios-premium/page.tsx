import { getAdminPreciosPremium } from '@/features/payments/actions';
import PreciosPremiumTable from '@/features/payments/premium/components/PreciosPremiumTable';

interface PageProps {
    searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function PreciosPremiumPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.q || '';

    const result = await getAdminPreciosPremium(page, 9, search);

    return (
        <div>
            <PreciosPremiumTable result={result} />
        </div>
    );
}
