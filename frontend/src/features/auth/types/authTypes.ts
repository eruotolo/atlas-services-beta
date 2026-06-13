// Tipos para respuestas de autenticación
export interface AuthResponse {
    error?: Record<string, string | string[]>;
    success?: boolean;
}

// Tipos para formularios de login/register
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    nombre: string;
    telefono: string;
}

// Tipos para usuario autenticado (complementa los tipos de next-auth)
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    roles: string[];
    nivelSuscripcion?: string;
}
