'use client';

import { actualizarServicio, crearServicio } from '@/features/services/actions';
import { Field, Select } from '@/shared/components/hireeo';

import type { Categoria, Servicio } from '../../types/shared';
import ServicioFormBase from '../forms/base/ServicioFormBase';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
}

interface AdminServicioFormProps {
    servicio?: Servicio;
    usuarios: Usuario[];
    categorias: Categoria[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AdminServicioForm({
    servicio,
    usuarios,
    categorias,
    onSuccess,
    onCancel,
}: AdminServicioFormProps) {
    // biome-ignore lint/suspicious/noExplicitAny: Payload dinámico
    const handleSubmit = async (payload: any) => {
        const result = servicio
            ? await actualizarServicio({ ...payload, id: servicio.id })
            : await crearServicio({ ...payload, usuarioId: payload.usuarioId });

        return result;
    };

    // Selector de usuario (solo se muestra en modo crear)
    const userSelector = !servicio ? (
        <Field label="Usuario (Proveedor)">
            <Select icon="user" name="usuarioId" required defaultValue="">
                <option value="">Seleccionar usuario...</option>
                {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} ({usuario.email})
                    </option>
                ))}
            </Select>
        </Field>
    ) : undefined;

    const usuarioActual = servicio ? usuarios.find((u) => u.id === servicio.usuarioId) : undefined;

    return (
        <ServicioFormBase
            servicio={servicio}
            categorias={categorias}
            onSubmit={handleSubmit}
            onSuccess={onSuccess}
            onCancel={onCancel}
            userSelector={userSelector}
            variant="admin"
            usuarioActual={usuarioActual}
        />
    );
}
