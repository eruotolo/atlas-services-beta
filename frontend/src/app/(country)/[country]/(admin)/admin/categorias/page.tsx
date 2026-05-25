import { getAdminCategorias } from '@/features/categories/actions';
import CategoriasTable from '@/features/categories/components/admin/CategoriasTable';

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
        <div>
            <CategoriasTable result={result} />
        </div>
    );
}
