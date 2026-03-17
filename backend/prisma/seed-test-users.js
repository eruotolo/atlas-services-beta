const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding test users for Playwright...');

    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

    const roleAdmin = await prisma.role.upsert({
        where: { name: 'SuperAdministrador' },
        update: {},
        create: { name: 'SuperAdministrador', active: true },
    });

    const roleUsuario = await prisma.role.upsert({
        where: { name: 'Usuario' },
        update: {},
        create: { name: 'Usuario', active: true },
    });

    const testAdmin = await prisma.user.upsert({
        where: { email: 'test-admin@chiloeservicios.cl' },
        update: { password: hashedPassword },
        create: {
            email: 'test-admin@chiloeservicios.cl',
            name: 'Test Admin',
            password: hashedPassword,
        },
    });

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: testAdmin.id, roleId: roleAdmin.id } },
        update: {},
        create: { userId: testAdmin.id, roleId: roleAdmin.id },
    });

    const testUser = await prisma.user.upsert({
        where: { email: 'test-user@chiloeservicios.cl' },
        update: { password: hashedPassword },
        create: {
            email: 'test-user@chiloeservicios.cl',
            name: 'Test User',
            password: hashedPassword,
        },
    });

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: testUser.id, roleId: roleUsuario.id } },
        update: {},
        create: { userId: testUser.id, roleId: roleUsuario.id },
    });

    console.log('Test users seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
