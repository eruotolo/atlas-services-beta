import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { getRoles, getUsers } from '@/features/users/actions';
import UsuariosTable from '@/features/users/components/admin/UsuariosTable';

type Props = {
    searchParams: Promise<{ page?: string; q?: string }>;
};

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigUsuariosPage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const ADMIN_ROLE_NAMES = ['SuperAdministrador', 'Administrador'];

    const [result, roles, countries] = await Promise.all([
        getUsers(page, 9, search, ADMIN_ROLE_NAMES),
        getRoles(),
        getAdminCountries(),
    ]);

    const adminRoles = roles.filter((r) => ADMIN_ROLE_NAMES.includes(r.nombre));

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Gestión de Administradores</SectionLabel>
                <p className="mt-1 text-sm text-sub">Administra los usuarios con acceso privilegiado a la plataforma.</p>
            </div>
            
            <div className="rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                <UsuariosTable
                    result={result}
                    roles={adminRoles}
                    countries={countries.map((c) => ({ code: c.code, name: c.name }))}
                />
            </div>
        </div>
    );
}
