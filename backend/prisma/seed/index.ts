import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { seedGeo } from './geo';
import { seedPrices } from './prices';
import { seedRolesUsers } from './roles-users';
import { seedTestData } from './test-data';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    try {
        // 1. Datos geográficos (países, regiones, localidades)
        await seedGeo();
        console.log('');

        // 2. Roles y SuperAdministradores
        await seedRolesUsers();
        console.log('');

        // 3. Planes premium por país
        await seedPrices();
        console.log('');

        // 4. Datos de prueba (servicios, categorías y usuarios)
        await seedTestData(prisma);
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
