'use client';

import { useId } from 'react';

import { User as UserIcon } from 'lucide-react';

import { actualizarServicio, crearServicio } from '@/features/services/actions';

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
    const id = useId();

    // biome-ignore lint/suspicious/noExplicitAny: Payload dinámico
    const handleSubmit = async (payload: any) => {
        const result = servicio
            ? await actualizarServicio({ ...payload, id: servicio.id })
            : await crearServicio({ ...payload, usuarioId: payload.usuarioId });

        return result;
    };

    // Selector de usuario (solo se muestra en modo crear)
    const userSelector = !servicio ? (
        <div>
            <label
                htmlFor={`${id}-usuarioId`}
                className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
            >
                Usuario (Proveedor)
            </label>
            <div className="relative">
                <UserIcon
                    size={18}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                />
                <select
                    id={`${id}-usuarioId`}
                    name="usuarioId"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pl-12 text-sm text-gray-900 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                >
                    <option value="" className="dark:bg-gray-900">
                        Seleccionar usuario...
                    </option>
                    {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id} className="dark:bg-gray-900">
                            {usuario.nombre} ({usuario.email})
                        </option>
                    ))}
                </select>
            </div>
        </div>
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
