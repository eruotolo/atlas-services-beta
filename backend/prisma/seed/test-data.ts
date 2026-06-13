

// Helper para generar slug único aleatorio
const generateUniqueSlug = (base: string) => {
  const uniqueId = Math.random().toString(36).substring(2, 7);
  return `${base}-${uniqueId}`;
};

export async function seedTestData(prisma: any) {
    console.log('📦 Creando datos de prueba (Categorías y Servicios)...');

    // 1. Crear Categorías
    const categoriesData = [
        { slug: 'plomeria', name: 'Plomería', nameEn: 'Plumbing', icon: 'wrench' },
        { slug: 'electricidad', name: 'Electricidad', nameEn: 'Electrical', icon: 'zap' },
        { slug: 'limpieza', name: 'Limpieza', nameEn: 'Cleaning', icon: 'sparkles' },
        { slug: 'jardineria', name: 'Jardinería', nameEn: 'Gardening', icon: 'leaf' },
        { slug: 'pintura', name: 'Pintura', nameEn: 'Painting', icon: 'paint-roller' },
    ];

    const createdCategories = [];
    for (const cat of categoriesData) {
        let existing = await prisma.serviceCategory.findFirst({ where: { slug: cat.slug } });
        if (!existing) {
            existing = await prisma.serviceCategory.create({
                data: cat,
            });
        }
        createdCategories.push(existing);
    }
    console.log(`✅ Categorías verificadas/creadas: ${createdCategories.length}`);

    // Obtener todos los países
    const countries = await prisma.country.findMany({ include: { regions: { include: { localities: true } } } });

    // Asegurar que exista un usuario proveedor genérico con avatar
    let provider = await prisma.user.findUnique({ where: { email: 'test_provider@example.com' } });
    if (!provider) {
        provider = await prisma.user.create({
            data: {
                email: 'test_provider@example.com',
                name: 'Juan Profesionales',
                password: 'hashed_password_dummy',
                avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&q=80', // Avatar amigable
            }
        });
        const providerRole = await prisma.role.findFirst({ where: { name: 'PROVIDER' } });
        if (providerRole) {
            await prisma.userRole.create({
                data: {
                    userId: provider.id,
                    roleId: providerRole.id,
                }
            });
        }
    } else {
        // Actualizar el proveedor existente con avatar por si no lo tenía
        if (!provider.avatar) {
            provider = await prisma.user.update({
                where: { id: provider.id },
                data: { avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&q=80' }
            });
        }
    }

    // Imágenes genéricas para los servicios por categoría
    const categoryImages = [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', // Plomería
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80', // Electricidad
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', // Limpieza
        'https://images.unsplash.com/photo-1416879598555-2518f87dc45b?w=800&q=80', // Jardinería
        'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80', // Pintura
    ];

    // Para cada país, crear 5 servicios
    for (const country of countries) {
        console.log(`🌍 Creando/Actualizando servicios para ${country.name}...`);
        
        // Obtener la primera región y localidad si existen, o dejar null
        const region = country.regions[0] || null;
        const locality = region?.localities[0] || null;

        for (let i = 1; i <= 5; i++) {
            const category = createdCategories[i - 1]; // Usar las 5 categorias en orden
            const baseSlug = `servicio-prueba-${i}-${country.code}`.toLowerCase();

            const existingService = await prisma.service.findFirst({ where: { slug: { startsWith: baseSlug } } });
            
            // Determinar idioma basado en el país
            const isEnglish = country.code === 'us';
            const titleStr = isEnglish 
                ? `${category.nameEn} Service in ${country.name}`
                : `Servicio de ${category.name} en ${country.name}`;
            
            const descStr = isEnglish
                ? `This is an excellent ${category.nameEn} service available in ${country.name}. Created automatically to test UX, featuring high quality photos and a professional profile for an amazing interface.`
                : `Este es un excelente servicio de ${category.name} disponible en ${country.name}. Creado automáticamente para probar la UX, con fotos de alta calidad y un perfil profesional para que la interfaz se vea increíble.`;

            const serviceData = {
                userId: provider.id,
                countryId: country.id,
                regionId: region?.id,
                localityId: locality?.id,
                commune: locality?.name || (isEnglish ? 'Downtown' : 'Centro'),
                title: titleStr,
                description: descStr,
                price: i * 1500,
                contactName: provider.name,
                contactEmail: provider.email,
                contactPhone: '+1234567890',
                active: true,
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Vence en 1 año
                mainImage: categoryImages[i - 1], // Añadir imagen principal!
                images: [categoryImages[i - 1], 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80'],
            };

            if (!existingService) {
                const uniqueSlug = generateUniqueSlug(baseSlug);
                await prisma.service.create({
                    data: {
                        ...serviceData,
                        slug: uniqueSlug,
                        categories: {
                            create: [
                                {
                                    categoryId: category.id
                                }
                            ]
                        }
                    }
                });
            } else {
                // Actualizar para añadir las imagenes y texto a los que ya estaban
                await prisma.service.update({
                    where: { id: existingService.id },
                    data: {
                        title: serviceData.title,
                        description: serviceData.description,
                        commune: serviceData.commune,
                        mainImage: serviceData.mainImage,
                        images: serviceData.images
                    }
                });
            }
        }
        console.log(`✅ 5 servicios verificados/creados con fotos en ${country.name}`);
    }
}
