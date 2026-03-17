import { getRoles, getUsers } from '@/features/users/actions';
import UsuariosTable from '@/features/users/components/admin/UsuariosTable';

interface PageProps {
    searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminUsuariosPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.q || '';

    const [result, roles] = await Promise.all([getUsers(page, 9, search), getRoles()]);

    return (
        <div>
            <UsuariosTable result={result} roles={roles} />
        </div>
    );
}
