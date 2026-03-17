import { getHistorialPagos } from '@/features/payments/actions';
import PagosTable from '@/features/payments/components/admin/PagosTable';

interface PageProps {
    searchParams: Promise<{ page?: string; startDate?: string; endDate?: string }>;
}

export default async function AdminPagosPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const startDate = params.startDate || undefined;
    const endDate = params.endDate || undefined;

    const result = await getHistorialPagos(page, 5, startDate, endDate);

    return (
        <div>
            <PagosTable result={result} />
        </div>
    );
}
