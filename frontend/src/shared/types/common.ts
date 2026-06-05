export interface CategoriaServicio {
    id: string;
    nombre: string;
    slug: string;
    icono?: string | null;
    orden: number;
    activo: boolean;
    serviceCount?: number;
}

export enum SubscriptionLevel {
    BASICO = 'Básico',
    PREMIUM = 'Premium',
}


export interface User {
    id: string;
    email: string;
    name: string;
    role: 'usuario' | 'proveedor' | 'admin';
    subscription: SubscriptionLevel;
}

export interface Service {
    id: string;
    slug: string;
    userId: string;
    userName: string;
    title: string;
    category: string;
    categoryId: string;
    categories?: Array<{
        id: string;
        nombre: string;
    }>;
    description: string;
    price: number;
    /** @deprecated Usar commune (string) para soporte multi-país */
    comuna: string;
    commune?: string;
    countryCode?: string;
    regionCode?: string;
    localitySlug?: string;
    rating: number;
    reviewsCount: number;
    image: string;
    isPremium: boolean;
}

export interface Review {
    id: string;
    serviceId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    serviceTitle: string;
    amount: number;
    date: string;
    status: 'completado' | 'pendiente';
}

export interface Sponsor {
    id: string;
    name: string;
    description: string;
    image: string;
    active: boolean;
}
