export interface PrecioPremium {
    id: string;
    descripcion: string;
    precio: number;
    duracionMeses: number;
    activo: boolean;
    currency: string;
    countryCode?: string;
    countryName?: string;
}

export interface Suscripcion {
    id: string;
    servicioId: string;
    duracionMeses: number;
    monto: number;
    metodoPago: string;
    estadoPago: string;
    transaccionId: string | null;
    fechaInicio: Date;
    fechaFin: Date;
    activa: boolean;
    createdAt: Date;
    updatedAt: Date;
    servicio: {
        titulo: string;
        usuario: { nombre: string; email: string };
        categoria: { nombre: string };
    };
}

export interface PaymentIntentResponse {
    clientSecret?: string;
    paymentUrl?: string; // For MercadoPago / webviews
    transactionId: string;
}
