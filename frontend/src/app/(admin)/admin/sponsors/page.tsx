import { getTodasSponsors } from '@/features/sponsors/actions';
import SponsorsTable from '@/features/sponsors/components/admin/SponsorsTable';

interface PageProps {
    searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminSponsorsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.q || '';

    const result = await getTodasSponsors(page, 9, search);

    return (
        <div>
            <SponsorsTable result={result} />
        </div>
    );
}
