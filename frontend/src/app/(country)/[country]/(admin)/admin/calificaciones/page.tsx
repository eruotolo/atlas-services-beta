import { getTodasCalificaciones } from '@/features/reviews/actions';
import CalificacionesTable from '@/features/reviews/components/admin/CalificacionesTable';
import { PageHeader } from '@/shared/components/hireeo';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminCalificacionesPage({ params, searchParams }: Props) {
    await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const result = await getTodasCalificaciones(page, 9, search);

    return (
        <>
            <PageHeader
                breadcrumb={['Admin', 'Calificaciones']}
                title="Reseñas y calificaciones"
                subtitle="Modera las reseñas publicadas por los usuarios."
            />
            <div style={{ padding: 28 }}>
                <CalificacionesTable result={result} />
            </div>
        </>
    );
}
