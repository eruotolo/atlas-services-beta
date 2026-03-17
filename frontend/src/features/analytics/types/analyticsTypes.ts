export type TipoInteraccion = 'VISTA' | 'WHATSAPP' | 'LLAMADA' | 'EMAIL' | 'COMPARTIR';

export interface Interaccion {
    id: string;
    servicioId: string;
    usuarioId?: string | null;
    tipo: TipoInteraccion;
    createdAt: Date;
}

// Tipos para el reporte de interacciones
export interface InteraccionReporte {
    ultimasInteracciones: InteraccionDetallada[];
    metricas: MetricasInteracciones;
}

export interface InteraccionDetallada extends Interaccion {
    servicio: {
        titulo: string;
        usuario: {
            nombre: string;
        };
    } | null;
    usuario: {
        nombre: string;
        email: string;
    } | null;
}

export interface MetricasInteracciones {
    totalGlobal: number;
    porTipo: Record<string, number>;
    topServicios: ServicioTopInteraccion[];
}

export interface ServicioTopInteraccion {
    servicioId: string;
    titulo: string;
    proveedor: string;
    total: number;
}
