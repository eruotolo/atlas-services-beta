import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

// @ts-ignore — tipos de prisma.config incompletos en v7.5.0
export default defineConfig({
    schema: './prisma/schema.prisma',
    migrate: {
        adapter: () => new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    },
});
