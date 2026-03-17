import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

const premiumPrices = [
    { durationMonths: 1, price: 9990, description: '1 mes de servicio premium' },
    { durationMonths: 3, price: 27990, description: '3 meses de servicio premium' },
    { durationMonths: 6, price: 54990, description: '6 meses de servicio premium' },
    { durationMonths: 12, price: 99990, description: '12 meses de servicio premium' },
];

export async function seedPrices() {
    console.log('💰 Creando planes premium...');

    for (const plan of premiumPrices) {
        await prisma.premiumPrice.upsert({
            where: { durationMonths: plan.durationMonths },
            update: {
                price: plan.price,
                description: plan.description,
            },
            create: {
                durationMonths: plan.durationMonths,
                price: plan.price,
                description: plan.description,
                active: true,
            },
        });
    }

    console.log(`  ✓ ${premiumPrices.length} planes premium creados`);
}
