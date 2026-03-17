import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkComunas() {
    console.log('🔍 Checking distinct comunas in database...\n');

    try {
        const servicios = await prisma.servicio.findMany({
            select: {
                comuna: true,
                titulo: true,
            },
        });

        const comunas = new Set(servicios.map(s => s.comuna));
        console.log('Unique Comunas found:', Array.from(comunas));

        console.log('\nDetailed sample (first 20):');
        servicios.slice(0, 20).forEach(s => {
            console.log(`- "${s.titulo}": "${s.comuna}"`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkComunas();
