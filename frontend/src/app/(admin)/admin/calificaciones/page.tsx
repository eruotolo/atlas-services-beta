import { getTodasCalificaciones } from '@/features/reviews/actions';
import CalificacionesTable from '@/features/reviews/components/admin/CalificacionesTable';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminCalificacionesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.q || '';

    const result = await getTodasCalificaciones(page, 9, search);

    return (
        <div>
            <CalificacionesTable result={result} />
        </div>
    );
}
