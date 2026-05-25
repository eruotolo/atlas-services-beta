import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

interface CountryPrices {
    code: string;
    currency: string;
    plans: Array<{ durationMonths: number; price: number; description: string }>;
}

const COUNTRY_PRICES: CountryPrices[] = [
    {
        code: 'cl',
        currency: 'CLP',
        plans: [
            { durationMonths: 1, price: 9990, description: '1 mes de servicio premium' },
            { durationMonths: 3, price: 27990, description: '3 meses de servicio premium' },
            { durationMonths: 6, price: 54990, description: '6 meses de servicio premium' },
            { durationMonths: 12, price: 99990, description: '12 meses de servicio premium' },
        ],
    },
    {
        code: 'ar',
        currency: 'ARS',
        plans: [
            { durationMonths: 1, price: 4990, description: '1 mes de servicio premium' },
            { durationMonths: 3, price: 13990, description: '3 meses de servicio premium' },
            { durationMonths: 6, price: 27490, description: '6 meses de servicio premium' },
            { durationMonths: 12, price: 49990, description: '12 meses de servicio premium' },
        ],
    },
    {
        code: 'uy',
        currency: 'UYU',
        plans: [
            { durationMonths: 1, price: 390, description: '1 mes de servicio premium' },
            { durationMonths: 3, price: 1090, description: '3 meses de servicio premium' },
            { durationMonths: 6, price: 2190, description: '6 meses de servicio premium' },
            { durationMonths: 12, price: 3990, description: '12 meses de servicio premium' },
        ],
    },
    {
        code: 'es',
        currency: 'EUR',
        plans: [
            { durationMonths: 1, price: 990, description: '1 mes de servicio premium' },
            { durationMonths: 3, price: 2790, description: '3 meses de servicio premium' },
            { durationMonths: 6, price: 5490, description: '6 meses de servicio premium' },
            { durationMonths: 12, price: 9990, description: '12 meses de servicio premium' },
        ],
    },
    {
        code: 'us',
        currency: 'USD',
        plans: [
            { durationMonths: 1, price: 990, description: '1 mes de servicio premium' },
            { durationMonths: 3, price: 2790, description: '3 meses de servicio premium' },
            { durationMonths: 6, price: 5490, description: '6 meses de servicio premium' },
            { durationMonths: 12, price: 9990, description: '12 meses de servicio premium' },
        ],
    },
];

export async function seedPrices() {
    console.log('💰 Creando planes premium por país...');

    for (const countryConfig of COUNTRY_PRICES) {
        const country = await prisma.country.findUnique({ where: { code: countryConfig.code } });
        if (!country) {
            console.log(`  ⚠ País ${countryConfig.code.toUpperCase()} no encontrado. Ejecuta primero el seed geo.`);
            continue;
        }

        for (const plan of countryConfig.plans) {
            await prisma.premiumPrice.upsert({
                where: {
                    countryId_durationMonths: {
                        countryId: country.id,
                        durationMonths: plan.durationMonths,
                    },
                },
                update: {
                    price: plan.price,
                    currency: countryConfig.currency,
                    description: plan.description,
                },
                create: {
                    countryId: country.id,
                    currency: countryConfig.currency,
                    durationMonths: plan.durationMonths,
                    price: plan.price,
                    description: plan.description,
                    active: true,
                },
            });
        }

        console.log(`  ✓ ${countryConfig.plans.length} planes creados para ${countryConfig.code.toUpperCase()} (${countryConfig.currency})`);
    }
}
