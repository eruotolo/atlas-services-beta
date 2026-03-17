import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

import type { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Tipo para las claves de iconos disponibles en Lucide (kebab-case)
export type CategoryIconName = keyof typeof dynamicIconImports;

// Utilidad: PascalCase -> kebab-case (DB -> Lucide)
// Ej: "ArrowRight" -> "arrow-right"
function toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Utilidad: kebab-case -> PascalCase (Lucide -> UI/DB)
// Ej: "arrow-right" -> "ArrowRight"
function toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, '').toUpperCase());
}

// Lista de nombres en PascalCase para la UI (simula el antiguo Object.keys(categoryIconMap))
export const ICON_NAMES = Array.from(new Set(Object.keys(dynamicIconImports).map(toPascalCase)));

interface IconProps extends Omit<LucideProps, 'name'> {
    name: string | null | undefined;
}

// Cache para almacenar los componentes creados por dynamic()
const iconCache: Record<string, ComponentType<LucideProps>> = {};

/**
 * Componente optimizado que carga dinámicamente el icono solicitado.
 * Evita cargar todos los iconos en el bundle inicial.
 * Usa caché para evitar recrear el componente en cada render.
 */
export const CategoryIcon = ({ name, ...props }: IconProps) => {
    const iconName = name || 'MoreHorizontal';
    const kebabName = toKebabCase(iconName);

    // Si ya existe en caché, retornarlo directamente
    if (iconCache[kebabName]) {
        const Icon = iconCache[kebabName];
        return <Icon {...props} />;
    }

    // Si no existe, intentar cargarlo
    const dynamicIconImport =
        // biome-ignore lint/suspicious/noExplicitAny: Importación dinámica
        (dynamicIconImports as Record<string, () => Promise<any>>)[kebabName] ||
        dynamicIconImports['more-horizontal'];

    // Crear el componente dinámico y guardarlo en caché
    const IconComponent = dynamic(dynamicIconImport);
    iconCache[kebabName] = IconComponent;

    return <IconComponent {...props} />;
};

// Listado íntegro de categorías basado en el seed (Mantenido por compatibilidad y seeders)
export const ALL_CATEGORIES_DATA = [
    { nombre: 'Gasfitería / Fontanería', slug: 'gasfiteria', icono: 'Droplets' },
    { nombre: 'Electricidad e Iluminación', slug: 'electricidad', icono: 'Zap' },
    { nombre: 'Cerrajería', slug: 'cerrajeria', icono: 'Key' },
    { nombre: 'Carpintería y Mueblista', slug: 'carpinteria', icono: 'Hammer' },
    { nombre: 'Pintura y Papel Mural', slug: 'pintura', icono: 'Paintbrush' },
    { nombre: 'Albañilería y Pisos', slug: 'albanileria', icono: 'HardHat' },
    { nombre: 'Vidriería y Aluminio', slug: 'vidrieria', icono: 'Square' },
    { nombre: 'Reparación de Techos y Goteras', slug: 'techos', icono: 'Home' },
    { nombre: 'Limpieza de Fachadas y Canaletas', slug: 'limpieza-fachadas', icono: 'Home' },
    { nombre: 'Destape de Desagües', slug: 'destapes', icono: 'Droplets' },
    { nombre: 'Climatización', slug: 'climatizacion', icono: 'Thermometer' },
    { nombre: 'Reparación de Electrodomésticos', slug: 'linea-blanca', icono: 'Smartphone' },
    { nombre: 'Limpieza de Hogar', slug: 'limpieza-hogar', icono: 'Sparkles' },
    { nombre: 'Limpieza de Tapices y Alfombras', slug: 'limpieza-tapices', icono: 'Waves' },
    { nombre: 'Fumigación y Control de Plagas', slug: 'fumigacion', icono: 'Bug' },
    { nombre: 'Jardinería y Paisajismo', slug: 'jardineria', icono: 'Leaf' },
    { nombre: 'Poda y Corte de Árboles', slug: 'poda', icono: 'Scissors' },
    { nombre: 'Mantención de Piscinas', slug: 'piscinas', icono: 'Waves' },
    { nombre: 'Riego Automático', slug: 'riego', icono: 'Droplets' },
    { nombre: 'Peluquería y Barbería', slug: 'peluqueria', icono: 'Scissors' },
    { nombre: 'Manicure y Pedicure', slug: 'manicure', icono: 'Sparkles' },
    { nombre: 'Maquillaje y Peinado', slug: 'maquillaje', icono: 'User' },
    { nombre: 'Depilación', slug: 'depilacion', icono: 'User' },
    { nombre: 'Tratamientos Faciales y Corporales', slug: 'estetica', icono: 'Heart' },
    { nombre: 'Masajes', slug: 'masajes', icono: 'Hand' },
    { nombre: 'Enfermería a Domicilio', slug: 'enfermeria', icono: 'Syringe' },
    { nombre: 'Cuidado de Adultos Mayores', slug: 'cuidado-adultos', icono: 'Heart' },
    { nombre: 'Podología', slug: 'podologia', icono: 'Footprints' },
    { nombre: 'Entrenador Personal / Yoga / Pilates', slug: 'entrenamiento', icono: 'Dumbbell' },
    { nombre: 'Nutrición y Dietética', slug: 'nutricion', icono: 'Salad' },
    { nombre: 'Peluquería y Baño de Mascotas', slug: 'peluqueria-mascotas', icono: 'Dog' },
    { nombre: 'Veterinaria a Domicilio', slug: 'veterinaria', icono: 'Stethoscope' },
    { nombre: 'Paseadores de Perros', slug: 'paseadores', icono: 'Dog' },
    { nombre: 'Cuidadores y Hotelería (Pet Sitting)', slug: 'pet-sitting', icono: 'Home' },
    { nombre: 'Adiestramiento Canino', slug: 'adiestramiento', icono: 'Award' },
    { nombre: 'Lavado de Autos (Car Wash)', slug: 'car-wash', icono: 'Car' },
    { nombre: 'Mecánica Ligera y Mantención', slug: 'mecanica', icono: 'Hammer' },
    { nombre: 'Baterías y Carga', slug: 'baterias', icono: 'Battery' },
    { nombre: 'Vulcanización y Neumáticos', slug: 'vulcanizacion', icono: 'Disc' },
    { nombre: 'Grúas y Remolque', slug: 'gruas', icono: 'Truck' },
    { nombre: 'Soporte Técnico Computacional', slug: 'soporte-tecnico', icono: 'Laptop' },
    { nombre: 'Instalación de Cámaras y Alarmas', slug: 'seguridad', icono: 'Camera' },
    { nombre: 'Redes, WiFi y Domótica', slug: 'redes', icono: 'Wifi' },
    { nombre: 'Recuperación de Datos', slug: 'recuperacion-datos', icono: 'Database' },
    { nombre: 'Banquetería y Catering', slug: 'banqueteria', icono: 'Utensils' },
    { nombre: 'Tortas, Pastelería y Repostería', slug: 'pasteleria', icono: 'Cake' },
    { nombre: 'Chef a Domicilio', slug: 'chef', icono: 'ChefHat' },
    { nombre: 'Decoración y Ambientación', slug: 'decoracion', icono: 'Palette' },
    { nombre: 'Animación y DJs', slug: 'animacion', icono: 'Music' },
    { nombre: 'Fotografía y Video de Eventos', slug: 'fotografia', icono: 'Camera' },
    { nombre: 'Reforzamiento Escolar', slug: 'reforzamiento', icono: 'GraduationCap' },
    { nombre: 'Idiomas', slug: 'idiomas', icono: 'Languages' },
    { nombre: 'Clases de Música e Instrumentos', slug: 'clases-musica', icono: 'Music' },
    { nombre: 'Clases de Arte y Manualidades', slug: 'clases-arte', icono: 'Palette' },
    { nombre: 'Fletes y Mudanzas', slug: 'fletes', icono: 'Truck' },
    { nombre: 'Retiro de Escombros y Cachureos', slug: 'escombros', icono: 'Trash' },
    { nombre: 'Mensajería y Encomiendas', slug: 'mensajeria', icono: 'Mail' },
    { nombre: 'Trámites y Gestoría', slug: 'tramites', icono: 'Clipboard' },
    { nombre: 'Contabilidad y Finanzas', slug: 'contabilidad', icono: 'FileText' },
    { nombre: 'Asesoría Legal / Abogados', slug: 'legal', icono: 'Scale' },
    { nombre: 'Diseño Gráfico y Web', slug: 'diseno', icono: 'Monitor' },
    { nombre: 'Otros', slug: 'otros', icono: 'MoreHorizontal' },
];
