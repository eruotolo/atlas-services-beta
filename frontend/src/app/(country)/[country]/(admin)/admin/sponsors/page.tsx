import { getTodasSponsors } from '@/features/sponsors/actions';
import SponsorsTable from '@/features/sponsors/components/admin/SponsorsTable';
import { PageHeader } from '@/shared/components/hireeo';
import { getDictionary } from '@/lib/i18n/getDictionary';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminSponsorsPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const dictionary = await getDictionary(country);
    const dict = dictionary.admin.sidebar;

    const result = await getTodasSponsors(page, 9, search, country);

    return (
        <>
            <PageHeader
                breadcrumb={[dict.overview || 'Admin', dict.sponsors || 'Sponsors']}
                title={dict.sponsors || 'Sponsors y publicidad'}
                subtitle="Banners y campañas que aparecen en la plataforma."
            />
            <div style={{ padding: 28 }}>
                <SponsorsTable result={result} />
            </div>
        </>
    );
}
