import { PrismaPg } from '@prisma/adapter-pg';
import { PaymentGateway, PrismaClient } from '@prisma/client';

import { AR_SEED } from './ar.seed';
import { CL_SEED } from './cl.seed';
import { ES_SEED } from './es.seed';
import { US_SEED } from './us.seed';
import { UY_SEED } from './uy.seed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

type CountrySeed = {
    country: {
        code: string;
        name: string;
        currency: string;
        locale: string;
        timezone: string;
        gateway: PaymentGateway;
        regionLabel: string;
        localityLabel: string;
    };
    regions: {
        name: string;
        code: string;
        localities: { name: string; slug: string }[];
    }[];
};

async function seedCountry(data: CountrySeed) {
    const country = await prisma.country.upsert({
        where: { code: data.country.code },
        update: {},
        create: { ...data.country },
    });

    for (const region of data.regions) {
        const { localities, ...regionData } = region;
        const geoRegion = await prisma.geoRegion.upsert({
            where: { countryId_code: { countryId: country.id, code: regionData.code } },
            update: {},
            create: { ...regionData, countryId: country.id },
        });

        for (const locality of localities) {
            await prisma.geoLocality.upsert({
                where: { regionId_slug: { regionId: geoRegion.id, slug: locality.slug } },
                update: {},
                create: { ...locality, regionId: geoRegion.id },
            });
        }
    }

    console.log(`  ✓ ${data.country.name} (${data.country.code})`);
}

export async function seedGeo() {
    console.log('🌍 Creando datos geográficos multi-país...');
    await seedCountry(CL_SEED);
    await seedCountry(AR_SEED);
    await seedCountry(UY_SEED);
    await seedCountry(ES_SEED);
    await seedCountry(US_SEED);
    console.log('  ✓ Datos geográficos completados');
}
