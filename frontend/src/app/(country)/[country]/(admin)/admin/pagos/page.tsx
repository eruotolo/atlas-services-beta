import { getHistorialPagos } from '@/features/payments/actions';
import PagosTable from '@/features/payments/components/admin/PagosTable';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; startDate?: string; endDate?: string }>;
};

export default async function AdminPagosPage({ params, searchParams }: Props) {
    await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const startDate = sp.startDate || undefined;
    const endDate = sp.endDate || undefined;

    const result = await getHistorialPagos(page, 5, startDate, endDate);

    return (
        <div>
            <PagosTable result={result} />
        </div>
    );
}
