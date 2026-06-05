import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ServiceLevel } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

interface ServiceSeed {
    slug: string;
    title: string;
    description: string;
    price: number;
    commune: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    mainImage: string;
    categorySlugs: readonly string[];
    averageRating: number;
    totalRatings: number;
    level: ServiceLevel;
    featured: boolean;
    regionCode: string;
    localitySlug: string;
}

const SERVICES: readonly ServiceSeed[] = [
    {
        slug: 'gasfiter-certificado-sec-urgencias-castro',
        title: 'Gásfiter Certificado SEC — Urgencias 24/7 en Castro',
        description:
            'Reparación de filtraciones, mantención de calefont, destapes con cámara. 12 años atendiendo Castro y Ancud. Sello SEC vigente.',
        price: 25000,
        commune: 'Castro',
        contactName: 'Marcelo Águila',
        contactEmail: 'marcelo@hireeo.app',
        contactPhone: '+56 9 1234 5678',
        mainImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['gasfiteria', 'destapes'],
        averageRating: 4.9,
        totalRatings: 312,
        level: ServiceLevel.PREMIUM,
        featured: true,
        regionCode: 'LL',
        localitySlug: 'castro',
    },
    {
        slug: 'electricista-residencial-instalaciones-puerto-montt',
        title: 'Electricista Residencial — Instalaciones y Reparaciones',
        description:
            'Aumento de capacidad, tableros, automatización LED. Trabajo garantizado por 1 año. Atiendo Puerto Montt y alrededores.',
        price: 35000,
        commune: 'Puerto Montt',
        contactName: 'Javier Pino',
        contactEmail: 'javier@hireeo.app',
        contactPhone: '+56 9 2345 6789',
        mainImage: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['electricidad'],
        averageRating: 4.8,
        totalRatings: 198,
        level: ServiceLevel.PREMIUM,
        featured: true,
        regionCode: 'LL',
        localitySlug: 'puerto-montt',
    },
    {
        slug: 'carpintero-muebles-cocina-medida-ancud',
        title: 'Maestro Carpintero — Muebles de Cocina a Medida',
        description:
            'Especialista en maderas nativas. Diseño + fabricación + instalación. 15 años de experiencia. Atiendo Ancud y Castro.',
        price: 450000,
        commune: 'Ancud',
        contactName: 'Sandra Bórquez',
        contactEmail: 'sandra@hireeo.app',
        contactPhone: '+56 9 3456 7890',
        mainImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['carpinteria'],
        averageRating: 4.9,
        totalRatings: 254,
        level: ServiceLevel.PREMIUM,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'ancud',
    },
    {
        slug: 'cerrajero-24h-aperturas-emergencia-puerto-montt',
        title: 'Cerrajero 24h — Aperturas de Emergencia',
        description:
            'Aperturas sin daños, copia de llaves al instante, cambio de cerraduras de seguridad. Atención 24/7 en Puerto Montt.',
        price: 18000,
        commune: 'Puerto Montt',
        contactName: 'Daniel Vergara',
        contactEmail: 'daniel@hireeo.app',
        contactPhone: '+56 9 4567 8901',
        mainImage: 'https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['cerrajeria'],
        averageRating: 4.7,
        totalRatings: 142,
        level: ServiceLevel.BASIC,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'puerto-montt',
    },
    {
        slug: 'pintor-residencial-comercial-castro',
        title: 'Pintor Residencial y Comercial — Acabados Profesionales',
        description:
            'Pintura interior y exterior, esmaltes especiales, papel mural. Pintamos casas, locales y oficinas. Atiendo Castro.',
        price: 280000,
        commune: 'Castro',
        contactName: 'Carlos Maldonado',
        contactEmail: 'carlos@hireeo.app',
        contactPhone: '+56 9 5678 9012',
        mainImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['pintura'],
        averageRating: 4.8,
        totalRatings: 287,
        level: ServiceLevel.PREMIUM,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'castro',
    },
    {
        slug: 'climatizacion-aire-acondicionado-puerto-montt',
        title: 'Climatización — Instalación y Mantención de Aire Acondicionado',
        description:
            'Splits, conductos, ductless. Instalación certificada, mantención anual, recarga de gas. Garantía de 2 años.',
        price: 320000,
        commune: 'Puerto Montt',
        contactName: 'Pedro Soto',
        contactEmail: 'pedro@hireeo.app',
        contactPhone: '+56 9 6789 0123',
        mainImage: 'https://images.unsplash.com/photo-1605577239329-46ee14f23b2e?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['climatizacion'],
        averageRating: 4.6,
        totalRatings: 92,
        level: ServiceLevel.BASIC,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'puerto-montt',
    },
    {
        slug: 'albanileria-pisos-ceramicos-castro',
        title: 'Albañil — Pisos Cerámicos y Porcelanato',
        description:
            'Instalación de pisos, fragüe, nivelación. Trabajo prolijo y a tiempo. 20 años de oficio en Chiloé.',
        price: 12000,
        commune: 'Castro',
        contactName: 'Luis Cárcamo',
        contactEmail: 'luis@hireeo.app',
        contactPhone: '+56 9 7890 1234',
        mainImage: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['albanileria'],
        averageRating: 4.5,
        totalRatings: 78,
        level: ServiceLevel.BASIC,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'castro',
    },
    {
        slug: 'reparacion-techos-goteras-ancud',
        title: 'Reparación de Techos y Goteras — Cubiertas y Hojalatería',
        description:
            'Reparación de filtraciones, recambio de planchas, canaletas y bajadas. Diagnóstico gratuito en Ancud y Castro.',
        price: 180000,
        commune: 'Ancud',
        contactName: 'Manuel Oyarzún',
        contactEmail: 'manuel@hireeo.app',
        contactPhone: '+56 9 8901 2345',
        mainImage: 'https://images.unsplash.com/photo-1632210826017-c7e88a07b58a?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['techos'],
        averageRating: 4.7,
        totalRatings: 156,
        level: ServiceLevel.PREMIUM,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'ancud',
    },
    {
        slug: 'vidrieria-aluminio-ventanas-puerto-montt',
        title: 'Vidriería y Aluminio — Ventanas y Mamparas',
        description:
            'Ventanas termopanel, mamparas de baño, espejos. Mediciones a domicilio. Atiendo Puerto Montt.',
        price: 220000,
        commune: 'Puerto Montt',
        contactName: 'Ricardo Mansilla',
        contactEmail: 'ricardo@hireeo.app',
        contactPhone: '+56 9 9012 3456',
        mainImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['vidrieria'],
        averageRating: 4.4,
        totalRatings: 64,
        level: ServiceLevel.BASIC,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'puerto-montt',
    },
    {
        slug: 'electrodomesticos-reparacion-castro',
        title: 'Reparación de Electrodomésticos — Línea Blanca',
        description:
            'Refrigeradores, lavadoras, secadoras, hornos. Diagnóstico a domicilio. Garantía de 90 días.',
        price: 22000,
        commune: 'Castro',
        contactName: 'Patricia Andrade',
        contactEmail: 'patricia@hireeo.app',
        contactPhone: '+56 9 0123 4567',
        mainImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200',
        categorySlugs: ['linea-blanca'],
        averageRating: 4.6,
        totalRatings: 109,
        level: ServiceLevel.BASIC,
        featured: false,
        regionCode: 'LL',
        localitySlug: 'castro',
    },
];

export async function seedServices() {
    console.log('🛠️  Creando servicios de prueba...');

    const country = await prisma.country.findUnique({ where: { code: 'cl' } });
    if (!country) {
        console.log('  ⚠️  Country "cl" no encontrado — saltando seed de servicios');
        return;
    }

    const adminUser = await prisma.user.findUnique({
        where: { email: 'edgardoruotolo@gmail.com' },
    });
    if (!adminUser) {
        console.log('  ⚠️  Usuario admin no encontrado — saltando seed de servicios');
        return;
    }

    const allCategories = await prisma.serviceCategory.findMany({
        where: { OR: [{ countryCode: null }, { countryCode: 'cl' }] },
    });
    const categoriesBySlug = new Map(allCategories.map((c) => [c.slug, c]));

    const regions = await prisma.geoRegion.findMany({ where: { countryId: country.id } });
    const regionsByCode = new Map(regions.map((r) => [r.code, r]));

    const regionIds = regions.map((r) => r.id);
    const localities = await prisma.geoLocality.findMany({
        where: { regionId: { in: regionIds } },
    });
    const localitiesBySlug = new Map(localities.map((l) => [l.slug, l]));

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    let created = 0;
    let updated = 0;

    for (const s of SERVICES) {
        const region = regionsByCode.get(s.regionCode);
        const locality = localitiesBySlug.get(s.localitySlug);
        const userName = s.contactName;

        const service = await prisma.service.upsert({
            where: { slug: s.slug },
            update: {
                title: s.title,
                description: s.description,
                price: s.price,
                commune: s.commune,
                contactName: s.contactName,
                contactEmail: s.contactEmail,
                contactPhone: s.contactPhone,
                mainImage: s.mainImage,
                averageRating: s.averageRating,
                totalRatings: s.totalRatings,
                level: s.level,
                featured: s.featured,
                active: true,
                regionId: region?.id ?? null,
                localityId: locality?.id ?? null,
            },
            create: {
                slug: s.slug,
                title: s.title,
                description: s.description,
                price: s.price,
                commune: s.commune,
                contactName: s.contactName,
                contactEmail: s.contactEmail,
                contactPhone: s.contactPhone,
                mainImage: s.mainImage,
                averageRating: s.averageRating,
                totalRatings: s.totalRatings,
                level: s.level,
                featured: s.featured,
                active: true,
                endDate: oneYearFromNow,
                user: { connect: { id: adminUser.id } },
                country: { connect: { id: country.id } },
                ...(region ? { region: { connect: { id: region.id } } } : {}),
                ...(locality ? { locality: { connect: { id: locality.id } } } : {}),
            },
        });

        // Sincronizar categorías (drop + recreate por slug)
        const categoryIds = s.categorySlugs
            .map((slug) => categoriesBySlug.get(slug)?.id)
            .filter((id): id is string => Boolean(id));

        await prisma.serviceCategoryMap.deleteMany({ where: { serviceId: service.id } });
        await prisma.serviceCategoryMap.createMany({
            data: categoryIds.map((categoryId) => ({ serviceId: service.id, categoryId })),
            skipDuplicates: true,
        });

        if (service.createdAt.getTime() === service.updatedAt.getTime()) {
            created += 1;
        } else {
            updated += 1;
        }
        void userName;
    }

    console.log(`  ✓ ${created} servicios creados, ${updated} actualizados`);
}
