import { getCategorias } from '@/features/categories/actions';
import { getAdminServices } from '@/features/services/actions';
import ServiciosTable from '@/features/services/components/admin/ServiciosTable';
import { getUsersAll } from '@/features/users/actions';
import { PageHeader } from '@/shared/components/hireeo';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminServiciosPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const [result, usuarios, categorias] = await Promise.all([
        getAdminServices(page, 9, search),
        getUsersAll(),
        getCategorias(country),
    ]);

    return (
        <>
            <PageHeader
                breadcrumb={['Admin', 'Servicios']}
                title="Servicios"
                subtitle="Gestiona los servicios publicados en la plataforma."
            />
            <div style={{ padding: 28 }}>
                <ServiciosTable result={result} usuarios={usuarios} categorias={categorias} />
            </div>
        </>
    );
}
