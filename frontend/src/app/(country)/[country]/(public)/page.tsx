import { getCategorias } from '@/features/categories/actions';
import { getPublicFeaturedServices } from '@/features/services/actions';

import {
    CategoriesGridSection,
    FeaturesGridSection,
    FinalCtaSection,
    HeroHireeoSection,
    PricingSection,
    StatsSection,
} from '@/features/home/components';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { mockServices } from '@/shared/lib/mockData';

export default async function CountryHomePage({
    params,
}: {
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    const dict = getDictionary(country);

    const [categories, realFeaturedServices] = await Promise.all([
        getCategorias(country),
        getPublicFeaturedServices(country),
    ]);

    const previewServices =
        realFeaturedServices.length >= 3
            ? realFeaturedServices.slice(0, 3)
            : mockServices.slice(0, 3);

    return (
        <>
            <HeroHireeoSection
                country={country}
                dict={dict}
                previewServices={previewServices}
            />
            <FeaturesGridSection dict={dict} />
            <CategoriesGridSection
                country={country}
                dict={dict}
                categories={categories}
            />
            <StatsSection dict={dict} />
            <PricingSection country={country} dict={dict} />
            <FinalCtaSection country={country} dict={dict} />
        </>
    );
}
