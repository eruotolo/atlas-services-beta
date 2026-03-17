// Contratos de respuesta del backend NestJS
// Campos en inglés según la API expuesta

export interface BackendAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        roles: string[];
        phone?: string | null;
    };
}

export interface BackendRefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export interface BackendCategoryDto {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    order: number;
    active: boolean;
}

export interface BackendSponsorDto {
    id: string;
    name: string;
    imageUrl: string;
    externalLink: string;
    description?: string | null;
    level: 'STANDARD' | 'PREMIUM' | 'SENIOR';
    active: boolean;
    startDate: string;
    endDate: string;
}

export interface BackendServiceDto {
    id: string;
    slug: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userPhone?: string | null;
    userAvatar?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    title: string;
    description: string;
    price: number;
    commune: string;
    mainImage?: string | null;
    images: string[];
    averageRating: number | null;
    totalRatings: number;
    featured: boolean;
    level: 'BASIC' | 'PREMIUM';
    active: boolean;
    startDate: string;
    endDate: string | null;
    categories: BackendCategoryDto[];
    socialNetworks?: BackendSocialNetworkDto[];
    reviews?: BackendReviewDto[];
    createdAt: string;
    updatedAt: string;
}

export interface BackendSocialNetworkDto {
    id: string;
    tipo: string;
    url: string;
}

export interface BackendReviewDto {
    id: string;
    userName: string;
    rating: number;
    comment?: string | null;
    date: string;
}

export interface BackendPaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface BackendServiciosQueryParams {
    query?: string;
    category?: string;
    commune?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
}

export interface BackendPrecioDto {
    id: string;
    name: string;
    price: number;
    duration: number;
    features: string[];
    active: boolean;
}

export interface BackendCreateReviewDto {
    serviceId: string;
    rating: number;
    comment?: string;
    name?: string;
    email?: string;
}

export interface BackendInteractionDto {
    serviceId: string;
    type: string;
    userId?: string;
}

export interface BackendCreateServiceDto {
    userId: string;
    title: string;
    description: string;
    price: number;
    commune: string;
    mainImage?: string | null;
    images?: string[];
    categoryIds: string[];
    socialNetworks?: Array<{ type: string; url: string }>;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
}

export interface BackendRegisterDto {
    email: string;
    password: string;
    name: string;
    phone?: string | null;
}
