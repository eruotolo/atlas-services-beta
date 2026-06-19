export interface Country {
    id: string;
    code: string;
    name: string;
    currency: string;
    locale: string;
    timezone: string;
    gateway: 'MERCADOPAGO' | 'STRIPE';
    regionLabel: string;
    localityLabel: string;
    paymentsEnabled: boolean;
    active: boolean;
}

export interface GeoRegion {
    id: string;
    countryId: string;
    name: string;
    code: string;
    active: boolean;
}

export interface GeoLocality {
    id: string;
    regionId: string;
    name: string;
    slug: string;
    active: boolean;
}
