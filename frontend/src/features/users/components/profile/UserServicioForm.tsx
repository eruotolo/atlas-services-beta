'use client';

import ServicioFormBase from '@/features/services/components/forms/base/ServicioFormBase';
import type { Categoria, Servicio } from '@/features/services/types/shared';
import { actualizarServicioPropio, crearServicioPropio } from '@/features/users/actions';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono?: string | null;
}

interface UserServicioFormProps {
    servicio?: Servicio;
    categorias: Categoria[];
    usuario?: Usuario;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UserServicioForm({
    servicio,
    categorias,
    usuario,
    onSuccess,
    onCancel,
}: UserServicioFormProps) {
    // biome-ignore lint/suspicious/noExplicitAny: Payload dinámico
    const handleSubmit = async (payload: any) => {
        const result = servicio
            ? await actualizarServicioPropio({ ...payload, id: servicio.id })
            : await crearServicioPropio(payload);

        return result;
    };

    return (
        <ServicioFormBase
            servicio={servicio}
            categorias={categorias}
            onSubmit={handleSubmit}
            onSuccess={onSuccess}
            onCancel={onCancel}
            variant="user"
            usuarioActual={usuario}
        />
    );
}
