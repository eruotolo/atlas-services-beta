import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function assignRole(userId: string, roleId: string, countryId?: string) {
    const existing = await prisma.userRole.findFirst({
        where: { userId, roleId, countryId: countryId ?? null },
    });
    if (!existing) {
        await prisma.userRole.create({
            data: { userId, roleId, countryId: countryId ?? null },
        });
    }
}

export async function seedRolesUsers() {
    console.log('👥 Creando roles...');

    const roleSuperAdmin = await prisma.role.upsert({
        where: { name: 'SuperAdmin' },
        update: {},
        create: { name: 'SuperAdmin', active: true },
    });

    await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: { name: 'Admin', active: true },
    });

    await prisma.role.upsert({
        where: { name: 'Professional' },
        update: {},
        create: { name: 'Professional', active: true },
    });

    await prisma.role.upsert({
        where: { name: 'Client' },
        update: {},
        create: { name: 'Client', active: true },
    });

    console.log('  ✓ Roles creados: SuperAdmin, Admin, Professional, Client');

    console.log('👤 Creando SuperAdministradores...');

    const users = [
        { name: 'Edgardo Ruotolo', email: 'edgardoruotolo@gmail.com', password: 'Bicho@026772' },
        { name: 'Luis Nuñez',      email: 'nluis@outlook.com',         password: 'Nexus@2026'  },
    ];

    for (const u of users) {
        const hashed = await bcrypt.hash(u.password, 12);
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name },
            create: { email: u.email, password: hashed, name: u.name },
        });
        await assignRole(user.id, roleSuperAdmin.id);
        console.log(`  ✓ ${u.name} (${u.email})`);
    }
}
