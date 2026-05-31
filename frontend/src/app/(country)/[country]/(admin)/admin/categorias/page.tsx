import { getAdminCategorias } from '@/features/categories/actions';
import CategoriasTable from '@/features/categories/components/admin/CategoriasTable';
import { PageHeader } from '@/shared/components/hireeo';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminCategoriasPage({ params, searchParams }: Props) {
    await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const result = await getAdminCategorias(page, 9, search);

    return (
        <>
            <PageHeader
                breadcrumb={['Admin', 'Categorías']}
                title="Categorías"
                subtitle="Taxonomía de servicios disponibles en la plataforma."
            />
            <div style={{ padding: 28 }}>
                <CategoriasTable result={result} />
            </div>
        </>
    );
}
