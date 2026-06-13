import { getAdminCategorias } from '@/features/categories/actions';
import CategoriasTable from '@/features/categories/components/admin/CategoriasTable';

type Props = {
    searchParams: Promise<{ page?: string; q?: string }>;
};

import { SectionLabel } from '@/shared/components/hireeo';

export default async function ConfigCategoriasPage({ searchParams }: Props) {
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const result = await getAdminCategorias(page, 9, search);

    return (
        <div className="w-full p-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <SectionLabel>Gestión de Categorías</SectionLabel>
                <p className="mt-1 text-sm text-sub">Administra las categorías de servicios disponibles en la plataforma.</p>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md dark:bg-tint/40">
                <CategoriasTable result={result} />
            </div>
        </div>
    );
}
