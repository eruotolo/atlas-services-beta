/**
 * seed-admin-users.ts
 *
 * Creates one Administrator user per country (AR, CL, ES, US, UY) for testing.
 * Password: Admin123!
 *
 * Usage (run from /backend):
 *   npx ts-node -r dotenv/config --project tsconfig.json ../prisma/seed/../../../.doc/seed-admin-users.ts
 *
 * Or easier — copy the script to backend/ and run:
 *   cd backend
 *   npx ts-node -r dotenv/config .doc/seed-admin-users.ts
 *
 * Simpler — run directly from project root:
 *   cd backend && DATABASE_URL=$(cat .env | grep DATABASE_URL | cut -d= -f2-) \
 *     npx ts-node -r dotenv/config -e "$(cat ../.doc/seed-admin-users.ts)"
 *
 * Recommended (from project root):
 *   cd backend && npx ts-node -r dotenv/config --project tsconfig.json \
 *     --skip-project ../doc/seed-admin-users.ts
 *
 * SIMPLEST — copy to backend/ then:
 *   cd backend
 *   cp ../.doc/seed-admin-users.ts ./seed-admin-users.ts
 *   npx ts-node -r dotenv/config seed-admin-users.ts
 *   rm seed-admin-users.ts
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

const ADMIN_PASSWORD = 'Admin123!';

const ADMIN_USERS = [
    { name: 'Admin Argentina',      email: 'admin.ar@hireeo.app', country: 'ar' },
    { name: 'Admin Chile',          email: 'admin.cl@hireeo.app', country: 'cl' },
    { name: 'Admin España',         email: 'admin.es@hireeo.app', country: 'es' },
    { name: 'Admin United States',  email: 'admin.us@hireeo.app', country: 'us' },
    { name: 'Admin Uruguay',        email: 'admin.uy@hireeo.app', country: 'uy' },
];

async function main() {
    console.log('🔐 Seed de usuarios Administrador por país\n');

    const adminRole = await prisma.role.findUnique({ where: { name: 'Administrador' } });
    if (!adminRole) {
        throw new Error('Role "Administrador" not found. Run the main seed first: pnpm --filter backend db:seed');
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

    for (const u of ADMIN_USERS) {
        const country = await prisma.country.findUnique({ where: { code: u.country } });
        if (!country) {
            console.warn(`  ⚠ Country "${u.country}" not found — skipping ${u.email}`);
            continue;
        }

        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name },
            create: { email: u.email, password: hashed, name: u.name },
        });

        const existing = await prisma.userRole.findFirst({
            where: { userId: user.id, roleId: adminRole.id, countryId: country.id },
        });

        if (!existing) {
            await prisma.userRole.create({
                data: { userId: user.id, roleId: adminRole.id, countryId: country.id },
            });
        }

        console.log(`  ✓ ${u.name} (${u.email}) → ${u.country.toUpperCase()}`);
    }

    console.log('\n✨ Done!');
    console.log(`\nCredenciales de prueba:`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    for (const u of ADMIN_USERS) {
        console.log(`  ${u.country.toUpperCase()}: ${u.email}`);
    }
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
