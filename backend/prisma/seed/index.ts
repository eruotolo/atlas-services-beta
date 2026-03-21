import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { seedCategories } from './categories';
import { seedGeo } from './geo';
import { seedPrices } from './prices';
import { seedRolesUsers } from './roles-users';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    try {
        // 1. Datos geográficos (países, regiones, localidades) — requerido por precios y servicios
        await seedGeo();
        console.log('');

        // 2. Roles y usuario admin
        await seedRolesUsers();
        console.log('');

        // 3. Categorías de servicios
        await seedCategories();
        console.log('');

        // 4. Planes premium (depende de países)
        await seedPrices();
        console.log('');

        console.log('✨ Seed completado exitosamente!');
    } catch (error) {
        console.error('❌ Error en seed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
