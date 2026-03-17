'use client';

import { useId, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    MessageSquare,
    Star,
    User as UserIcon,
} from 'lucide-react';

import { crearCalificacion } from '@/features/reviews/actions';

interface Service {
    id: string;
    slug: string;
    title: string;
    userName: string;
}

interface User {
    id: string;
    name: string | null;
    email: string | null;
}

interface LeaveReviewClientProps {
    service: Service;
    currentUser: User | null;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Flujo de formulario complejo
export default function LeaveReviewClient({ service, currentUser }: LeaveReviewClientProps) {
    const router = useRouter();
    const id = useId();

    // Start at step 2 if user is logged in
    const [step, setStep] = useState(currentUser ? 2 : 1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        comment: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step === 1 && !currentUser) {
            if (!formData.name || !formData.email) return;
            // Validate email format simple
            if (!formData.email.includes('@')) {
                setError('Ingresa un email válido');
                return;
            }
            setError('');
        }
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setLoading(true);
        setError('');

        try {
            const payload = {
                servicioId: service.id,
                rating,
                comment: formData.comment,
                // Only include if user not logged in
                ...(!currentUser && {
                    name: formData.name,
                    email: formData.email,
                }),
            };

            const result = await crearCalificacion(payload);

            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else {
                setLoading(false);
                setSuccess(true);
                if (result.message) {
                    setSuccessMessage(result.message);
                }
                setTimeout(() => router.push(`/servicio/${service.slug}`), 4000);
            }
        } catch (_err) {
            setError('Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="animate-in fade-in zoom-in bg-background mx-auto min-h-screen max-w-7xl px-4 py-32 text-center duration-500">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="mb-4 text-4xl font-black text-gray-900 italic dark:text-white">
                    ¡Gracias por tu reseña!
                </h2>
                <p className="mx-auto mb-4 max-w-md text-lg text-gray-500 dark:text-gray-400">
                    Tu opinión ayuda a construir confianza en nuestra comunidad chilota.
                </p>
                {successMessage && (
                    <div className="mx-auto mb-8 max-w-md rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        {successMessage}
                    </div>
                )}
                <p className="animate-pulse text-sm font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                    Volviendo al servicio...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen px-4 py-16 transition-colors duration-300">
            <div className="mx-auto max-w-2xl">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 flex cursor-pointer items-center gap-2 font-bold text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <ArrowLeft size={18} /> Volver al servicio
                </button>

                <div className="mb-10 text-center">
                    <span className="mb-2 block text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
                        Cuéntanos tu experiencia
                    </span>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                        Reseña para {service.userName}
                    </h1>
                    <p className="mt-2 font-medium text-gray-500 italic dark:text-gray-400">
                        &quot;{service.title}&quot;
                    </p>
                </div>

                <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-2xl shadow-blue-900/5 md:p-12 dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
                    <form onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex flex-col items-center gap-3 rounded-xl bg-red-50 p-4 text-center text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                <p>{error}</p>
                                {error.includes('ya existe un usuario') && (
                                    <a
                                        href={`/login?callbackUrl=/servicio/${service.slug}/resena`}
                                        className="rounded-lg bg-red-100 px-4 py-2 text-xs text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                                    >
                                        Iniciar sesión con este correo
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Step 1: User Identity (Simplified flow) */}
                        {step === 1 && (
                            <div className="animate-in slide-in-from-right-8 space-y-6 duration-500">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <UserIcon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Primero, ¿quién eres?
                                        </h2>
                                        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                                            Solo necesitamos estos datos para validar tu reseña.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        ¿Ya tienes cuenta?{' '}
                                        <a
                                            href={`/login?callbackUrl=/servicio/${service.slug}/resena`}
                                            className="font-bold underline hover:text-blue-600 dark:hover:text-blue-200"
                                        >
                                            Inicia sesión aquí
                                        </a>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor={`${id}-name`}
                                            className="mb-2 block px-1 text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
                                        >
                                            Tu Nombre
                                        </label>
                                        <input
                                            id={`${id}-name`}
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="Ej: Pedro Chiguay"
                                            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-medium transition-all outline-none focus:border-blue-500 dark:border-white/5 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`${id}-email`}
                                            className="mb-2 block px-1 text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
                                        >
                                            Tu Correo
                                        </label>
                                        <input
                                            id={`${id}-email`}
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            type="email"
                                            placeholder="pedro@correo.cl"
                                            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-medium transition-all outline-none focus:border-blue-500 dark:border-white/5 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!formData.name || !formData.email}
                                    className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
                                >
                                    Continuar <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Rating and Comment */}
                        {step === 2 && (
                            <div className="animate-in slide-in-from-right-8 space-y-8 duration-500">
                                <div className="text-center">
                                    <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                                        ¿Cuántas estrellas le das a este servicio?
                                    </h2>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="cursor-pointer transition-transform hover:scale-125"
                                            >
                                                <Star
                                                    size={40}
                                                    fill={
                                                        (hoverRating || rating) >= star
                                                            ? 'currentColor'
                                                            : 'none'
                                                    }
                                                    className={
                                                        (hoverRating || rating) >= star
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-200 dark:text-gray-700'
                                                    }
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-xs font-black tracking-widest text-blue-600 uppercase dark:text-blue-400">
                                        {rating === 1
                                            ? 'Muy malo'
                                            : rating === 2
                                              ? 'Malo'
                                              : rating === 3
                                                ? 'Regular'
                                                : rating === 4
                                                  ? 'Muy bueno'
                                                  : rating === 5
                                                    ? '¡Excelente!'
                                                    : 'Toca una estrella'}
                                    </p>
                                </div>

                                <div className="space-y-4 border-t border-gray-100 pt-4 dark:border-white/5">
                                    <label
                                        htmlFor={`${id}-comment`}
                                        className="flex items-center gap-2 px-1 text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
                                    >
                                        <MessageSquare size={14} className="text-blue-500" />
                                        Tu comentario
                                    </label>
                                    <textarea
                                        id={`${id}-comment`}
                                        name="comment"
                                        required
                                        value={formData.comment}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Cuéntanos cómo fue el trabajo, si llegó a la hora, etc..."
                                        className="w-full resize-none rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 leading-relaxed font-medium transition-all outline-none focus:border-blue-500 dark:border-white/5 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading || rating === 0 || !formData.comment}
                                        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-black text-white shadow-2xl shadow-blue-900/20 transition-all hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
                                    >
                                        {loading ? 'Enviando...' : 'Publicar mi reseña'}
                                    </button>
                                    {!currentUser && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="cursor-pointer text-xs font-bold text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            Atrás, corregir mis datos
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="mt-12 flex items-start gap-4 rounded-[2rem] border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/20">
                    <div className="dark:bg-background shrink-0 rounded-xl bg-white p-2 text-blue-600 shadow-sm dark:text-blue-400">
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                            Reseña Pública
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-blue-700 italic dark:text-blue-400">
                            Al publicar, tu nombre y calificación serán visibles para todos.
                            Ayúdanos a mantener la comunidad respetuosa y honesta.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
