import { getHistorialPagos } from '@/features/payments/actions';
import PagosTable from '@/features/payments/components/admin/PagosTable';
import { PageHeader } from '@/shared/components/hireeo';
import { getDictionary } from '@/lib/i18n/getDictionary';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; startDate?: string; endDate?: string }>;
};

export default async function AdminPagosPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const startDate = sp.startDate || undefined;
    const endDate = sp.endDate || undefined;

    const dictionary = await getDictionary(country);
    const dict = dictionary.admin.sidebar;

    const result = await getHistorialPagos(page, 5, startDate, endDate, country);

    return (
        <>
            <PageHeader
                breadcrumb={[dict.overview || 'Admin', dict.payments || 'Pagos y Caja']}
                title={dict.payments || 'Pagos y caja'}
                subtitle="Historial de transacciones, suscripciones y reembolsos."
            />
            <div style={{ padding: 28 }}>
                <PagosTable result={result} />
            </div>
        </>
    );
}
