import { getRoles, getUsers } from '@/features/users/actions';
import UsuariosTable from '@/features/users/components/admin/UsuariosTable';
import { PageHeader } from '@/shared/components/hireeo';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminUsuariosPage({ params, searchParams }: Props) {
    await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const [result, roles] = await Promise.all([getUsers(page, 9, search), getRoles()]);

    return (
        <>
            <PageHeader
                breadcrumb={['Admin', 'Usuarios']}
                title="Usuarios"
                subtitle="Cuentas registradas, roles y permisos."
            />
            <div style={{ padding: 28 }}>
                <UsuariosTable result={result} roles={roles} />
            </div>
        </>
    );
}
