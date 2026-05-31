import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }) });
async function main() {
    const all = await prisma.service.findMany({ include: { country: true, categories: { include: { category: true } } } });
    console.log(`Total: ${all.length}`);
    for (const s of all) {
        console.log(`- ${s.slug} | active=${s.active} | endDate=${s.endDate.toISOString().slice(0,10)} | country=${s.country.code} | cats=${s.categories.map(c => c.category.slug).join(',')}`);
    }
    await prisma.$disconnect();
}
main().catch(console.error);
