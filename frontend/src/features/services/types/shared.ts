export interface RedSocial {
    tipo:
        | 'WEBSITE'
        | 'FACEBOOK'
        | 'INSTAGRAM'
        | 'LINKEDIN'
        | 'TIKTOK'
        | 'TWITTER'
        | 'YOUTUBE'
        | 'OTRO';
    url: string;
}

export interface Servicio {
    id: string;
    titulo: string;
    categoria: string; // ID de la categoría (backward compatibility)
    categories?: Array<{
        id: string;
        nombre: string;
    }>;
    descripcion: string;
    precio: number;
    comuna: string;
    usuarioId?: string;
    imagenPrincipal?: string | null;
    imagenes?: string[];
    redesSociales?: RedSocial[];
    nombreContacto?: string | null;
    emailContacto?: string | null;
    telefonoContacto?: string | null;
}

export interface Categoria {
    id: string;
    nombre: string;
}

export interface ServicioPayload {
    id?: string;
    titulo: string;
    categoriasIds: string[];
    comuna: string;
    precio: number;
    descripcion: string;
    imagenPrincipal: string;
    imagenes: string[];
    redesSociales: RedSocial[];
    usuarioId?: string;
    nombreContacto?: string;
    emailContacto?: string;
    telefonoContacto?: string;
}

export interface Result {
    error?: string;
    servicio?: unknown;
}
