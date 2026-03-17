import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

export async function seedRolesUsers() {
    console.log('👥 Creando roles...');

    const roleSuperAdmin = await prisma.role.upsert({
        where: { name: 'SuperAdministrador' },
        update: {},
        create: { name: 'SuperAdministrador', active: true },
    });

    await prisma.role.upsert({
        where: { name: 'Usuario' },
        update: {},
        create: { name: 'Usuario', active: true },
    });

    console.log('  ✓ Roles creados: SuperAdministrador, Usuario');

    console.log('👤 Creando usuario SuperAdmin...');
    const hashedPassword = await bcrypt.hash('Bicho_026772', 12);

    const adminUser = await prisma.user.upsert({
        where: { email: 'edgardoruotolo@gmail.com' },
        update: {},
        create: {
            email: 'edgardoruotolo@gmail.com',
            password: hashedPassword,
            name: 'Edgardo Ruotolo',
        },
    });

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: roleSuperAdmin.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: roleSuperAdmin.id,
        },
    });

    console.log('  ✓ Usuario SuperAdmin creado y rol asignado');

    console.log('👤 Creando Test Users para E2E...');
    const testAdminUser = await prisma.user.upsert({
        where: { email: 'test-admin@chiloeservicios.cl' },
        update: {},
        create: {
            email: 'test-admin@chiloeservicios.cl',
            password: await bcrypt.hash('TestPassword123!', 12),
            name: 'Test Administrator',
        },
    });

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: testAdminUser.id,
                roleId: roleSuperAdmin.id,
            },
        },
        update: {},
        create: {
            userId: testAdminUser.id,
            roleId: roleSuperAdmin.id,
        },
    });

    const roleNormalUser = await prisma.role.findUnique({ where: { name: 'Usuario' } });
    if(roleNormalUser) {
        const testUserUser = await prisma.user.upsert({
            where: { email: 'test-user@chiloeservicios.cl' },
            update: {},
            create: {
                email: 'test-user@chiloeservicios.cl',
                password: await bcrypt.hash('TestPassword123!', 12),
                name: 'Test Regular User',
            },
        });

        await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: testUserUser.id,
                    roleId: roleNormalUser.id,
                },
            },
            update: {},
            create: {
                userId: testUserUser.id,
                roleId: roleNormalUser.id,
            },
        });
    }
    console.log('  ✓ Test users para E2E creados y roles asignados');
}
