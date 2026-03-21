import { getTodasSponsors } from '@/features/sponsors/actions';
import SponsorsTable from '@/features/sponsors/components/admin/SponsorsTable';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminSponsorsPage({ params, searchParams }: Props) {
    await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const result = await getTodasSponsors(page, 9, search);

    return (
        <div>
            <SponsorsTable result={result} />
        </div>
    );
}
