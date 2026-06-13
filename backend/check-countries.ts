import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Cargar .env manualmente
const envFile = readFileSync(resolve(__dirname, '.env'), 'utf8');
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        if (!process.env[key]) {
            process.env[key] = val;
        }
    }
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- RESUMEN MULTI-PAÍS ---');
    const countries = await prisma.country.findMany();
    for (const country of countries) {
        console.log(`\n🌍 País: ${country.name} (${country.code})`);
        
        const usersCount = await prisma.user.count({
            where: { roles: { some: { countryId: country.id } } }
        });
        console.log(`👤 Usuarios Admin/Scoped: ${usersCount}`);
        
        const servicesCount = await prisma.service.count({
            where: { countryId: country.id }
        });
        console.log(`🛠️  Servicios publicados: ${servicesCount}`);
        
        const categoriesCount = await prisma.serviceCategory.count({
            where: { countryCode: country.code }
        });
        console.log(`📁 Categorías: ${categoriesCount}`);
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
