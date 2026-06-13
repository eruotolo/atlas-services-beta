import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { getRoles, getUsers } from '@/features/users/actions';
import UsuariosTable from '@/features/users/components/admin/UsuariosTable';
import { PageHeader } from '@/shared/components/hireeo';
import { getDictionary } from '@/lib/i18n/getDictionary';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminUsuariosPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const dictionary = await getDictionary(country);
    const dict = dictionary.admin.sidebar;

    const [result, roles, countries] = await Promise.all([
        getUsers(page, 9, search, undefined, country),
        getRoles(),
        getAdminCountries(),
    ]);

    return (
        <>
            <PageHeader
                breadcrumb={[dict.overview || 'Admin', dict.users || 'Usuarios']}
                title={dict.users || 'Usuarios'}
                subtitle="Cuentas registradas, roles y permisos."
            />
            <div style={{ padding: 28 }}>
                <UsuariosTable
                    result={result}
                    roles={roles}
                    countries={countries.map((c) => ({ code: c.code, name: c.name }))}
                />
            </div>
        </>
    );
}
