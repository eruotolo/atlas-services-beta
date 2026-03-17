'use client';

import { useId, useState } from 'react';

import { AlertCircle, CheckCircle2, Loader2, Star } from 'lucide-react';

import { crearCalificacion } from '@/features/reviews/actions';

interface LeaveReviewClientProps {
    servicioId: string;
    servicioTitulo: string;
    usuarioAutenticado: boolean;
}

export default function LeaveReviewClient({
    servicioId,
    servicioTitulo,
    usuarioAutenticado,
}: LeaveReviewClientProps) {
    const id = useId();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (rating === 0) {
            setStatus({ type: 'error', message: 'Por favor selecciona una puntuación' });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        try {
            const result = await crearCalificacion({
                servicioId,
                rating,
                comment,
                name: !usuarioAutenticado ? name : undefined,
                email: !usuarioAutenticado ? email : undefined,
            });

            if (result.error) {
                setStatus({ type: 'error', message: result.error });
            } else {
                setStatus({
                    type: 'success',
                    message:
                        result.message || '¡Gracias! Tu reseña ha sido enviada para moderación.',
                });
                // Reset form
                setRating(0);
                setComment('');
                setName('');
                setEmail('');
            }
        } catch (_error) {
            setStatus({ type: 'error', message: 'Error al enviar la reseña. Inténtalo de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (status?.type === 'success') {
        return (
            <div className="rounded-[2.5rem] border border-green-100 bg-green-50 p-8 text-center md:p-12 dark:border-green-900/30 dark:bg-green-950/20">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="mb-4 text-2xl font-black text-gray-900 dark:text-white">
                    ¡Reseña Enviada!
                </h2>
                <p className="mb-8 text-gray-600 dark:text-gray-400">{status.message}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <a
                        href="/"
                        className="rounded-2xl bg-white px-8 py-3 font-bold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    >
                        Volver al Inicio
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm md:p-12 dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                    Calificar Servicio
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    ¿Cómo fue tu experiencia con{' '}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                        {servicioTitulo}
                    </span>
                    ?
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
                {status?.type === 'error' && (
                    <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle size={20} className="shrink-0" />
                        <p>{status.message}</p>
                    </div>
                )}

                {/* Stars Rating */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-xs font-black tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Puntuación
                    </span>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star
                                    size={40}
                                    className={`transition-colors ${
                                        (hoverRating || rating) >= star
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-200 dark:text-gray-800'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {rating === 5
                                ? '¡Excelente! 😍'
                                : rating === 4
                                  ? 'Muy Bueno! 😊'
                                  : rating === 3
                                    ? 'Bueno 👍'
                                    : rating === 2
                                      ? 'Regular 😐'
                                      : 'Malo ☹️'}
                        </p>
                    )}
                </div>

                {/* Comentario */}
                <div className="space-y-2">
                    <label
                        htmlFor={`${id}-comment`}
                        className="block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                    >
                        Tu Comentario
                    </label>
                    <textarea
                        id={`${id}-comment`}
                        required
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comparte los detalles de tu experiencia..."
                        className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
                    />
                </div>

                {/* Guest Fields */}
                {!usuarioAutenticado && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor={`${id}-name`}
                                className="block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                            >
                                Tu Nombre
                            </label>
                            <input
                                type="text"
                                id={`${id}-name`}
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor={`${id}-email`}
                                className="block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                            >
                                Tu Correo
                            </label>
                            <input
                                type="email"
                                id={`${id}-email`}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="juan@email.com"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
                            />
                        </div>
                        <div className="rounded-xl bg-blue-50 p-4 sm:col-span-2 dark:bg-blue-950/20">
                            <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-400">
                                <span className="font-bold">Nota:</span> Al enviar tu reseña,
                                crearemos una cuenta gratuita para ti. Te enviaremos una contraseña
                                temporal a tu correo para que puedas gestionar tus reseñas en el
                                futuro.
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 text-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl bg-blue-600 px-12 py-4 font-black text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 disabled:opacity-50 dark:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Enviando...
                            </>
                        ) : (
                            'Publicar Reseña'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
