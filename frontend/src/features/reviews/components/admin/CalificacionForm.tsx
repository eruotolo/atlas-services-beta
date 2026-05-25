'use client';

import { useId, useState } from 'react';

import { AlertTriangle, Trash2 } from 'lucide-react';

type EstadoComentario = 'PENDIENTE' | 'ACTIVO' | 'ELIMINADO';

import { actualizarCalificacion } from '@/features/reviews/actions';
import { eliminarServicio } from '@/features/services/actions';

interface Calificacion {
    id: string;
    estrellas: number;
    comentario: string | null;
    estado: EstadoComentario;
    servicio: {
        id: string;
        titulo: string;
    };
}

interface CalificacionFormProps {
    calificacion: Calificacion;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CalificacionForm({
    calificacion,
    onSuccess,
    onCancel,
}: CalificacionFormProps) {
    const textareaId = useId();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingService, setIsDeletingService] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [estrellas, setEstrellas] = useState(calificacion.estrellas);
    const [comentario, setComentario] = useState(calificacion.comentario || '');
    const [estado, setEstado] = useState<EstadoComentario>(calificacion.estado);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await actualizarCalificacion({
                id: calificacion.id,
                estrellas,
                comentario,
                estado,
            });

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        } catch (_err) {
            setError('Error al actualizar la calificación');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteService() {
        if (
            !confirm(
                `¿ESTÁS SEGURO DE ELIMINAR LA PUBLICACIÓN: "${calificacion.servicio.titulo}"?\n\nEsta acción eliminará permanentemente el servicio y todas sus calificaciones. No se puede deshacer.`,
            )
        ) {
            return;
        }

        setIsDeletingService(true);
        setError(null);

        try {
            const result = await eliminarServicio(calificacion.servicio.id);
            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        } catch (_err) {
            setError('Error al eliminar la publicación');
        } finally {
            setIsDeletingService(false);
        }
    }

    return (
        <div className="space-y-8 transition-colors duration-300">
            {/* Cabecera con info del servicio */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-gray-800">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase dark:text-gray-500">
                    Moderando reseña de:
                </p>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {calificacion.servicio.titulo}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-300">
                        Estado
                    </span>
                    <div className="flex gap-4">
                        {(['PENDIENTE', 'ACTIVO', 'ELIMINADO'] as const).map((est) => (
                            <label
                                key={est}
                                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                                    estado === est
                                        ? 'bg-brand text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="estado"
                                    value={est}
                                    checked={estado === est}
                                    onChange={() => setEstado(est)}
                                    className="hidden"
                                />
                                {est}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-300">
                        Puntuación (Estrellas)
                    </span>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setEstrellas(star)}
                                className={`cursor-pointer text-2xl ${star <= estrellas ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor={textareaId}
                        className="text-sm font-bold text-gray-900 dark:text-gray-300"
                    >
                        Comentario
                    </label>
                    <textarea
                        id={textareaId}
                        rows={4}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/5 dark:bg-gray-800 dark:text-white"
                        placeholder="Escribe el comentario..."
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading || isDeletingService}
                        className="flex-1 cursor-pointer rounded-2xl bg-gray-100 py-4 font-bold text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || isDeletingService}
                        className="btn-primary flex-1 cursor-pointer rounded-2xl py-4 disabled:opacity-50"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>

            <div className="border-t border-gray-100 pt-6 dark:border-white/5">
                <div className="flex flex-col gap-4 rounded-2xl bg-red-50 p-6 dark:border dark:border-red-900/30 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className="shrink-0 text-red-600 dark:text-red-400"
                            size={24}
                        />
                        <div>
                            <h4 className="font-black text-red-900 dark:text-red-300">
                                Zona de Peligro
                            </h4>
                            <p className="text-xs text-red-700 dark:text-red-400/70">
                                Si esta publicación infringe las normas o tiene múltiples denuncias
                                por mal servicio, puedes eliminarla por completo.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleDeleteService}
                        disabled={isLoading || isDeletingService}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:shadow-none"
                    >
                        <Trash2 size={18} />
                        {isDeletingService
                            ? 'Eliminando Publicación...'
                            : 'Eliminar Publicación (Servicio)'}
                    </button>
                </div>
            </div>
        </div>
    );
}
