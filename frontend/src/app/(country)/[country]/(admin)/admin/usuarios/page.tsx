import { getRoles, getUsers } from '@/features/users/actions';
import UsuariosTable from '@/features/users/components/admin/UsuariosTable';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminUsuariosPage({ params, searchParams }: Props) {
    // country disponible para filtrado futuro cuando la action lo soporte
    await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const [result, roles] = await Promise.all([getUsers(page, 9, search), getRoles()]);

    return (
        <div>
            <UsuariosTable result={result} roles={roles} />
        </div>
    );
}
