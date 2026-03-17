import { getAdminCategorias } from '@/features/categories/actions';
import CategoriasTable from '@/features/categories/components/admin/CategoriasTable';

interface PageProps {
    searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminCategoriasPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.q || '';

    const result = await getAdminCategorias(page, 9, search);

    return (
        <div>
            <CategoriasTable result={result} />
        </div>
    );
}
