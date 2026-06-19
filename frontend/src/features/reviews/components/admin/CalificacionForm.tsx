'use client';
import { Btn } from '@/shared/components/hireeo';

import { useId, useState } from 'react';

import { AlertTriangle, Trash2 } from '@/shared/components/icons';

type EstadoComentario = 'PENDIENTE' | 'ACTIVO' | 'ELIMINADO';

import { actualizarCalificacion } from '@/features/reviews/actions';
import { eliminarServicio } from '@/features/services/actions';
import { notify } from '@/shared/lib/notify';

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
                notify.error({ title: 'Error al actualizar reseña', description: result.error });
            } else {
                notify.success({ title: 'Reseña actualizada' });
                onSuccess();
            }
        } catch (_err) {
            setError('Error al actualizar la calificación');
            notify.error({ title: 'Error al actualizar la calificación' });
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
                notify.error({ title: 'Error al eliminar', description: result.error });
            } else {
                notify.success({ title: 'Publicación eliminada' });
                onSuccess();
            }
        } catch (_err) {
            setError('Error al eliminar la publicación');
            notify.error({ title: 'Error al eliminar la publicación' });
        } finally {
            setIsDeletingService(false);
        }
    }

    return (
        <div className="space-y-8 transition-colors duration-300">
            {/* Cabecera con info del servicio */}
            <div className="rounded-2xl border border-line bg-tint p-4">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                    Moderando reseña de:
                </p>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {calificacion.servicio.titulo}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <span className="text-sm font-semibold text-ink">
                        Estado
                    </span>
                    <div className="flex gap-4">
                        {(['PENDIENTE', 'ACTIVO', 'ELIMINADO'] as const).map((est) => (
                            <label
                                key={est}
                                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                                    estado === est
                                        ? 'bg-brand text-white'
                                        : 'bg-tint text-muted hover:bg-line'
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
                    <span className="text-sm font-semibold text-ink">
                        Puntuación (Estrellas)
                    </span>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setEstrellas(star)}
                                className={`cursor-pointer text-2xl ${star <= estrellas ? 'text-yellow-400' : 'text-line'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor={textareaId}
                        className="text-sm font-semibold text-ink"
                    >
                        Comentario
                    </label>
                    <textarea
                        id={textareaId}
                        rows={4}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        className="w-full rounded-2xl border border-line bg-bg p-4 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        placeholder="Escribe el comentario..."
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading || isDeletingService}
                        className="flex-1 cursor-pointer rounded-2xl bg-tint py-4 font-semibold text-muted transition-colors hover:bg-line disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <Btn variant="primary" type="submit" disabled={isLoading || isDeletingService}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Btn>
                </div>
            </form>

            <div className="mt-8">
                <div className="flex flex-col gap-4 rounded-2xl bg-red-50 p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className="shrink-0 text-red-600"
                            size={24}
                        />
                        <div>
                            <h4 className="text-[13px] font-semibold text-red-900">
                                Zona de Peligro
                            </h4>
                            <p className="text-xs text-red-700">
                                Si esta publicación infringe las normas o tiene múltiples denuncias
                                por mal servicio, puedes eliminarla por completo.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleDeleteService}
                        disabled={isLoading || isDeletingService}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
