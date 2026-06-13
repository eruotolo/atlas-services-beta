import { getAdminCategorias } from '@/features/categories/actions';
import CategoriasTable from '@/features/categories/components/admin/CategoriasTable';
import { PageHeader } from '@/shared/components/hireeo';
import { getDictionary } from '@/lib/i18n/getDictionary';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminCategoriasPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const dictionary = await getDictionary(country);
    const dict = dictionary.admin.sidebar;

    const result = await getAdminCategorias(page, 9, search, country);

    return (
        <>
            <PageHeader
                breadcrumb={[dict.overview || 'Admin', dict.categories || 'Categorías']}
                title={dict.categories || 'Categorías'}
                subtitle="Taxonomía de servicios disponibles en la plataforma."
            />
            <div style={{ padding: 28 }}>
                <CategoriasTable result={result} />
            </div>
        </>
    );
}
