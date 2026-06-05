import { PrismaPg } from '@prisma/adapter-pg';
import { CommentStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

interface ReviewerSeed {
    email: string;
    name: string;
}

interface RatingTemplate {
    stars: number;
    comment: string;
}

const REVIEWERS: readonly ReviewerSeed[] = [
    { email: 'maria.jose.q@hireeo-seed.app', name: 'María José Q.' },
    { email: 'ricardo.s@hireeo-seed.app', name: 'Ricardo S.' },
    { email: 'camila.v@hireeo-seed.app', name: 'Camila V.' },
    { email: 'pedro.s@hireeo-seed.app', name: 'Pedro Soto C.' },
];

const RATING_POOL: readonly RatingTemplate[] = [
    {
        stars: 5,
        comment:
            'Vino al día siguiente, resolvió todo en menos de una hora. Cobró exactamente lo cotizado. Súper recomendable.',
    },
    {
        stars: 5,
        comment:
            'Trabajo prolijo, dejó todo limpio. Explicó cómo cuidar la instalación. Profesional 100%.',
    },
    {
        stars: 4,
        comment:
            'Atendió rápido. Llegó un poco tarde por el temporal pero avisó con tiempo. El trabajo bien hecho.',
    },
    {
        stars: 5,
        comment:
            'Excelente profesional. Mantención correcta, sin sorpresas. Volveré a contratar sin dudarlo.',
    },
];

async function ensureReviewers(): Promise<Array<{ id: string; name: string }>> {
    const reviewers: Array<{ id: string; name: string }> = [];
    const hashedPassword = await bcrypt.hash('Reviewer_2026!', 12);

    for (const r of REVIEWERS) {
        const user = await prisma.user.upsert({
            where: { email: r.email },
            update: { name: r.name },
            create: {
                email: r.email,
                password: hashedPassword,
                name: r.name,
            },
            select: { id: true, name: true },
        });
        reviewers.push(user);
    }

    return reviewers;
}

function pickRating(serviceIdx: number, reviewerIdx: number): RatingTemplate {
    // Rotamos el pool de ratings con offset por servicio + reviewer para variar
    const idx = (serviceIdx + reviewerIdx) % RATING_POOL.length;
    return RATING_POOL[idx];
}

export async function seedRatings(): Promise<void> {
    console.log('⭐ Creando reseñas de prueba...');

    const reviewers = await ensureReviewers();
    if (reviewers.length === 0) {
        console.log('  ⚠️  No se pudieron crear reviewers — saltando seed de ratings');
        return;
    }

    const services = await prisma.service.findMany({
        select: { id: true, slug: true, userId: true },
        orderBy: { createdAt: 'asc' },
    });

    if (services.length === 0) {
        console.log('  ⚠️  No hay servicios en DB — saltando seed de ratings');
        return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (let sIdx = 0; sIdx < services.length; sIdx += 1) {
        const service = services[sIdx];
        const ratings: Array<{ stars: number }> = [];

        for (let rIdx = 0; rIdx < reviewers.length; rIdx += 1) {
            const reviewer = reviewers[rIdx];
            // Salvaguarda: nunca dejar que el dueño del servicio se autoreseñe
            if (reviewer.id === service.userId) {
                skippedCount += 1;
                continue;
            }
            const template = pickRating(sIdx, rIdx);

            await prisma.rating.upsert({
                where: {
                    serviceId_userId: { serviceId: service.id, userId: reviewer.id },
                },
                update: {
                    stars: template.stars,
                    comment: template.comment,
                    status: CommentStatus.ACTIVE,
                },
                create: {
                    serviceId: service.id,
                    userId: reviewer.id,
                    stars: template.stars,
                    comment: template.comment,
                    status: CommentStatus.ACTIVE,
                },
            });
            ratings.push({ stars: template.stars });
            createdCount += 1;
        }

        const avg =
            ratings.length > 0
                ? Number(
                      (
                          ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length
                      ).toFixed(1),
                  )
                : null;

        await prisma.service.update({
            where: { id: service.id },
            data: {
                averageRating: avg,
                totalRatings: ratings.length,
            },
        });
    }

    console.log(
        `  ✓ ${createdCount} reseñas creadas/actualizadas (${skippedCount} skipped por ser dueño)`,
    );
}
