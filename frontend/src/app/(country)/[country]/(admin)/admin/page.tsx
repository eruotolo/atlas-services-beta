import AdminOverviewPageContent from '@/app/(admin)/admin/page';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';

type Props = { params: Promise<{ country: string }> };

export default async function AdminPage({ params }: Props) {
    const { country } = await params;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();

    return (
        <>
            <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    País: {countryName}
                </span>
            </div>
            <AdminOverviewPageContent />
        </>
    );
}
