import { getCategorias } from '@/features/categories/actions';
import { getAdminServices } from '@/features/services/actions';
import ServiciosTable from '@/features/services/components/admin/ServiciosTable';
import { getUsersAll } from '@/features/users/actions';

interface PageProps {
    searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminServiciosPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.q || '';

    const [result, usuarios, categorias] = await Promise.all([
        getAdminServices(page, 9, search),
        getUsersAll(),
        getCategorias(),
    ]);

    return (
        <div>
            <ServiciosTable result={result} usuarios={usuarios} categorias={categorias} />
        </div>
    );
}
