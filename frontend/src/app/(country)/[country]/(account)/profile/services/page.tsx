import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { getUserServices } from '@/features/services/actions/queries';
import { MyServiceItem } from '@/features/services/components/profile/MyServiceItem';
import { Btn, Icon } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Mis Servicios',
};

export default async function ProfileServicesPage({
    params,
}: {
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const dict = await getDictionary(country);
    const services = await getUserServices(session.user.id);

    return (
        <div className="p-6 lg:p-10">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-[22px] font-bold text-ink">Mis Servicios</h1>
                    <p className="mt-1 text-[14px] text-sub">Gestiona los servicios que tienes publicados.</p>
                </div>
                <Btn
                    variant="primary"
                    icon="plus"
                    href={`/${country}/publish`}
                >
                    Publicar nuevo
                </Btn>
            </div>

            {services.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-tint p-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-line/50 mb-4">
                        <Icon name="briefcase" size={20} stroke="var(--sub)" />
                    </div>
                    <h3 className="mb-2 text-[16px] font-semibold text-ink">No tienes servicios publicados</h3>
                    <p className="mb-6 text-[13px] text-sub">Comienza a ofrecer tus habilidades y gana dinero en la plataforma.</p>
                    <Btn
                        variant="primary"
                        href={`/${country}/publish`}
                        className="mx-auto"
                    >
                        Publicar mi primer servicio
                    </Btn>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {services.map((service) => (
                        <MyServiceItem
                            key={service.id}
                            service={service}
                            countryCode={country}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
