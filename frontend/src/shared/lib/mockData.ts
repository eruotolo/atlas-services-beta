import { type Service, SubscriptionLevel, type User } from '@/shared/types/common';

export const mockUsers: User[] = [
    {
        id: 'u1',
        email: 'juan@hireeo.app',
        name: 'Juan Perez',
        role: 'proveedor',
        subscription: SubscriptionLevel.BASICO,
    },
    {
        id: 'u2',
        email: 'maria@hireeo.app',
        name: 'Maria Soto',
        role: 'usuario',
        subscription: SubscriptionLevel.BASICO,
    },
];

export const mockServices: Service[] = [
    {
        id: 's1',
        slug: 'gasfiter-certificado-sec-urgencias-24-7',
        userId: 'u1',
        userName: 'Juan Perez',
        title: 'Gásfiter Certificado SEC - Urgencias 24/7',
        category: 'Gásfiter',
        categoryId: 'gasfiter',
        description:
            'Reparación de filtraciones, mantención de calefont y destapes. Atiendo en todo Castro y alrededores.',
        price: 25000,
        comuna: 'Castro',
        rating: 4.8,
        reviewsCount: 15,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
        isPremium: true,
    },
    {
        id: 's2',
        slug: 'maestro-carpintero-muebles-de-cocina',
        userId: 'u1',
        userName: 'Juan Perez',
        title: 'Maestro Carpintero - Muebles de Cocina',
        category: 'Carpintero',
        categoryId: 'carpinteria',
        description: 'Especialista en maderas nativas y diseños modernos para tu cocina.',
        price: 45000,
        comuna: 'Ancud',
        rating: 4.5,
        reviewsCount: 8,
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800',
        isPremium: false,
    },
    {
        id: 's3',
        slug: 'fletes-y-mudanzas-chonchi-castro',
        userId: 'u1',
        userName: 'Juan Perez',
        title: 'Fletes y Mudanzas Chonchi - Castro',
        category: 'Flete',
        categoryId: 'flete',
        description:
            'Servicio de flete rápido con camión de 2 toneladas. Carga y descarga incluida.',
        price: 35000,
        comuna: 'Chonchi',
        rating: 5.0,
        reviewsCount: 5,
        image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800',
        isPremium: false,
    },
    {
        id: 's4',
        slug: 'instalaciones-electricas-domiciliarias',
        userId: 'u5',
        userName: 'Electricidad Eléctrica',
        title: 'Instalaciones Eléctricas Domiciliarias',
        category: 'Electricista',
        categoryId: 'electricista',
        description: 'Aumento de capacidad, tableros y cableado nuevo. Trabajo garantizado.',
        price: 20000,
        comuna: 'Dalcahue',
        rating: 4.2,
        reviewsCount: 10,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
        isPremium: false,
    },
];

export const mockSponsors = [
    {
        id: 'ms1',
        nombre: 'Constructora Andina',
        imagenUrl:
            'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1000',
        linkExterno: '#',
        descripcion: 'Construimos tus sueños en la isla. Casas llave en mano.',
        nivel: 'SENIOR',
    },
    {
        id: 'ms2',
        nombre: 'Turismo Archipiélago',
        imagenUrl:
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000',
        linkExterno: '#',
        descripcion: 'Navega por los canales y descubre la magia del sur.',
        nivel: 'SENIOR',
    },
    {
        id: 'ms3',
        nombre: 'Maderas del Sur',
        imagenUrl:
            'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800',
        linkExterno: '#',
        descripcion: 'Venta de maderas nativas dimensionadas. Entrega a domicilio.',
        nivel: 'PREMIUM',
    },
    {
        id: 'ms4',
        nombre: 'Restaurante El Curanto',
        imagenUrl:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
        linkExterno: '#',
        descripcion: 'El mejor curanto en hoyo de la isla. Reservas disponibles.',
        nivel: 'PREMIUM',
    },
    {
        id: 'ms5',
        nombre: 'Hostal Los Palafitos',
        imagenUrl:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
        linkExterno: '#',
        descripcion: 'Alojamiento con vista al mar en los clásicos palafitos.',
        nivel: 'PREMIUM',
    },
    {
        id: 'ms6',
        nombre: 'Artesanías de Dalcahue',
        imagenUrl:
            'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&q=80&w=800',
        linkExterno: '#',
        descripcion: 'Lana, madera y cestería tradicional.',
        nivel: 'STANDARD',
    },
];
