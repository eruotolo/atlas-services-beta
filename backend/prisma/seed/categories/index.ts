import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

const categories = [
    // Hogar y Mantención
    { name: 'Gasfitería / Fontanería', slug: 'gasfiteria', icon: 'Droplets' },
    { name: 'Electricidad e Iluminación', slug: 'electricidad', icon: 'Zap' },
    { name: 'Cerrajería', slug: 'cerrajeria', icon: 'Key' },
    { name: 'Carpintería y Mueblista', slug: 'carpinteria', icon: 'Hammer' },
    { name: 'Pintura y Papel Mural', slug: 'pintura', icon: 'Paintbrush' },
    { name: 'Albañilería y Pisos', slug: 'albanileria', icon: 'HardHat' },
    { name: 'Vidriería y Aluminio', slug: 'vidrieria', icon: 'Square' },
    { name: 'Reparación de Techos y Goteras', slug: 'techos', icon: 'Home' },
    { name: 'Limpieza de Fachadas y Canaletas', slug: 'limpieza-fachadas', icon: 'Home' },
    { name: 'Destape de Desagües', slug: 'destapes', icon: 'Droplets' },
    { name: 'Climatización', slug: 'climatizacion', icon: 'Thermometer' },
    { name: 'Reparación de Electrodomésticos', slug: 'linea-blanca', icon: 'Smartphone' },

    // Limpieza
    { name: 'Limpieza de Hogar', slug: 'limpieza-hogar', icon: 'Sparkles' },
    { name: 'Limpieza de Tapices y Alfombras', slug: 'limpieza-tapices', icon: 'Waves' },
    { name: 'Fumigación y Control de Plagas', slug: 'fumigacion', icon: 'Bug' },

    // Jardín
    { name: 'Jardinería y Paisajismo', slug: 'jardineria', icon: 'Leaf' },
    { name: 'Poda y Corte de Árboles', slug: 'poda', icon: 'Scissors' },
    { name: 'Mantención de Piscinas', slug: 'piscinas', icon: 'Waves' },
    { name: 'Riego Automático', slug: 'riego', icon: 'Droplets' },

    // Belleza y Bienestar
    { name: 'Peluquería y Barbería', slug: 'peluqueria', icon: 'Scissors' },
    { name: 'Manicure y Pedicure', slug: 'manicure', icon: 'Sparkles' },
    { name: 'Maquillaje y Peinado', slug: 'maquillaje', icon: 'User' },
    { name: 'Depilación', slug: 'depilacion', icon: 'User' },
    { name: 'Tratamientos Faciales y Corporales', slug: 'estetica', icon: 'Heart' },
    { name: 'Masajes', slug: 'masajes', icon: 'Hand' },

    // Salud y Cuidado
    { name: 'Enfermería a Domicilio', slug: 'enfermeria', icon: 'Syringe' },
    { name: 'Cuidado de Adultos Mayores', slug: 'cuidado-adultos', icon: 'Heart' },
    { name: 'Podología', slug: 'podologia', icon: 'Footprints' },
    { name: 'Entrenador Personal / Yoga / Pilates', slug: 'entrenamiento', icon: 'Dumbbell' },
    { name: 'Nutrición y Dietética', slug: 'nutricion', icon: 'Salad' },

    // Mascotas
    { name: 'Peluquería y Baño de Mascotas', slug: 'peluqueria-mascotas', icon: 'Dog' },
    { name: 'Veterinaria a Domicilio', slug: 'veterinaria', icon: 'Stethoscope' },
    { name: 'Paseadores de Perros', slug: 'paseadores', icon: 'Dog' },
    { name: 'Cuidadores y Hotelería (Pet Sitting)', slug: 'pet-sitting', icon: 'Home' },
    { name: 'Adiestramiento Canino', slug: 'adiestramiento', icon: 'Award' },

    // Automotriz
    { name: 'Lavado de Autos (Car Wash)', slug: 'car-wash', icon: 'Car' },
    { name: 'Mecánica Ligera y Mantención', slug: 'mecanica', icon: 'Wrench' },
    { name: 'Baterías y Carga', slug: 'baterias', icon: 'Battery' },
    { name: 'Vulcanización y Neumáticos', slug: 'vulcanizacion', icon: 'Disc' },
    { name: 'Grúas y Remolque', slug: 'gruas', icon: 'Truck' },

    // Tecnología
    { name: 'Soporte Técnico Computacional', slug: 'soporte-tecnico', icon: 'Laptop' },
    { name: 'Instalación de Cámaras y Alarmas', slug: 'seguridad', icon: 'Camera' },
    { name: 'Redes, WiFi y Domótica', slug: 'redes', icon: 'Wifi' },
    { name: 'Recuperación de Datos', slug: 'recuperacion-datos', icon: 'Database' },

    // Eventos y Gastronomía
    { name: 'Banquetería y Catering', slug: 'banqueteria', icon: 'Utensils' },
    { name: 'Tortas, Pastelería y Repostería', slug: 'pasteleria', icon: 'Cake' },
    { name: 'Chef a Domicilio', slug: 'chef', icon: 'ChefHat' },
    { name: 'Decoración y Ambientación', slug: 'decoracion', icon: 'Palette' },
    { name: 'Animación y DJs', slug: 'animacion', icon: 'Music' },
    { name: 'Fotografía y Video de Eventos', slug: 'fotografia', icon: 'Camera' },

    // Educación
    { name: 'Reforzamiento Escolar', slug: 'reforzamiento', icon: 'GraduationCap' },
    { name: 'Idiomas', slug: 'idiomas', icon: 'Languages' },
    { name: 'Clases de Música e Instrumentos', slug: 'clases-musica', icon: 'Music' },
    { name: 'Clases de Arte y Manualidades', slug: 'clases-arte', icon: 'Palette' },

    // Logística y Trámites
    { name: 'Fletes y Mudanzas', slug: 'fletes', icon: 'Truck' },
    { name: 'Retiro de Escombros y Cachureos', slug: 'escombros', icon: 'Trash' },
    { name: 'Mensajería y Encomiendas', slug: 'mensajeria', icon: 'Mail' },
    { name: 'Trámites y Gestoría', slug: 'tramites', icon: 'Clipboard' },

    // Profesionales
    { name: 'Contabilidad y Finanzas', slug: 'contabilidad', icon: 'FileText' },
    { name: 'Asesoría Legal / Abogados', slug: 'legal', icon: 'Scale' },
    { name: 'Diseño Gráfico y Web', slug: 'diseno', icon: 'Monitor' },

    // Turismo y Hospedaje
    { name: 'Hotel', slug: 'hotel', icon: 'Building' },
    { name: 'Hospedaje / Cabañas', slug: 'hospedaje', icon: 'Home' },
    { name: 'Tours y Excursiones', slug: 'tours', icon: 'Map' },
    { name: 'Paseo en Botes / Navegación', slug: 'paseo-botes', icon: 'Ship' },
    { name: 'Trekking Guiado', slug: 'trekking', icon: 'Mountain' },

    // Otros
    { name: 'Otros', slug: 'otros', icon: 'MoreHorizontal' },
];

export async function seedCategories() {
    console.log('📂 Creando categorías de servicios...');

    for (let index = 0; index < categories.length; index++) {
        const cat = categories[index];
        const existing = await prisma.serviceCategory.findFirst({
            where: { slug: cat.slug, countryCode: null },
        });

        if (existing) {
            await prisma.serviceCategory.update({
                where: { id: existing.id },
                data: { name: cat.name, icon: cat.icon, order: index + 1 },
            });
        } else {
            await prisma.serviceCategory.create({
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    icon: cat.icon,
                    order: index + 1,
                    active: true,
                },
            });
        }
    }


    console.log(`  ✓ ${categories.length} categorías creadas`);
}
