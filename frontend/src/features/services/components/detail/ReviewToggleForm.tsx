'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactElement } from 'react';

import { crearCalificacion } from '@/features/reviews/actions';
import type { Dictionary } from '@/lib/i18n/types';
import { Avatar, Btn, Icon, Mono, Pill, Toggle } from '@/shared/components/hireeo';

interface ReviewToggleFormProps {
    dict: Dictionary;
    serviceId: string;
    serviceSlug: string;
    serviceTitle: string;
    country: string;
    isLoggedIn: boolean;
    isOwner: boolean;
    professionalName: string;
    currentUserName: string | null;
    hireDateLabel: string | null;
    serviceReference: string | null;
}

const RATING_LABELS: Record<number, string> = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Muy bueno',
    5: 'Excelente',
};

function StarPicker({
    rating,
    onChange,
}: {
    rating: number;
    onChange: (rating: number) => void;
}): ReactElement {
    return (
        <div className="inline-flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const active = rating >= star;
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        aria-label={`${star} estrella${star === 1 ? '' : 's'}`}
                        className="cursor-pointer transition-transform hover:scale-110"
                    >
                        <Icon
                            name="star"
                            size={26}
                            fill={active ? 'var(--amber)' : 'none'}
                            stroke="var(--amber)"
                            strokeWidth={1.6}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export function ReviewToggleForm({
    dict,
    serviceId,
    serviceSlug,
    serviceTitle,
    country,
    isLoggedIn,
    isOwner,
    professionalName,
    currentUserName,
    hireDateLabel,
    serviceReference,
}: ReviewToggleFormProps): ReactElement {
    const router = useRouter();
    const [expanded, setExpanded] = useState<boolean>(false);
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [recommends, setRecommends] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();

    function handleToggleClick(): void {
        if (!isLoggedIn) {
            const callback = encodeURIComponent(`/${country}/servicio/${serviceSlug}`);
            router.push(`/${country}/login?callbackUrl=${callback}`);
            return;
        }
        setExpanded((prev) => !prev);
    }

    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault();
        if (rating === 0) {
            setError('Selecciona una calificación');
            return;
        }
        if (comment.trim().length < 10) {
            setError('Tu comentario debe tener al menos 10 caracteres');
            return;
        }
        setError('');

        startTransition(async () => {
            const result = await crearCalificacion({
                servicioId: serviceId,
                rating,
                comment: comment.trim(),
            });
            if (result.error) {
                setError(result.error);
                return;
            }
            setSuccess(true);
            setTimeout(() => {
                setExpanded(false);
                setRating(0);
                setComment('');
                setSuccess(false);
                router.refresh();
            }, 1500);
        });
    }

    const reviewerName = currentUserName ?? 'Tu reseña';
    const hireText = hireDateLabel
        ? `Contrataste a ${professionalName} ${hireDateLabel}`
        : `Vas a calificar a ${professionalName}`;
    const referenceText = serviceReference
        ? `${serviceTitle} · ${serviceReference}`
        : serviceTitle;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-3">
                <h2
                    className="m-0"
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: 'var(--ink)',
                        letterSpacing: '-0.015em',
                    }}
                >
                    Reseñas recientes
                </h2>
                {isOwner ? (
                    <span
                        className="text-[12px]"
                        style={{ color: 'var(--muted)' }}
                    >
                        Las reseñas las hacen tus clientes
                    </span>
                ) : (
                    <Btn
                        variant="secondary"
                        size="sm"
                        icon="edit"
                        onClick={handleToggleClick}
                        aria-expanded={expanded}
                    >
                        {dict.serviceDetail.reviewsLeaveCta}
                    </Btn>
                )}
            </div>

            {expanded && isLoggedIn && !isOwner ? (
                <form
                    onSubmit={handleSubmit}
                    className="mt-4 rounded-xl border p-5"
                    style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
                >
                    <div className="mb-4 flex items-start gap-3">
                        <Avatar name={reviewerName} size={40} />
                        <div className="min-w-0 flex-1">
                            <div
                                className="text-[14px] font-semibold leading-tight"
                                style={{ color: 'var(--ink)' }}
                            >
                                {hireText}
                            </div>
                            <Mono
                                className="mt-0.5 inline-block text-[11.5px]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {referenceText}
                            </Mono>
                        </div>
                        <Pill tone="success" icon="check">
                            Trabajo completado
                        </Pill>
                    </div>

                    <div
                        className="mb-4 rounded-md p-4"
                        style={{ background: 'var(--tint)' }}
                    >
                        <div
                            className="mb-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase"
                            style={{ color: 'var(--sub)' }}
                        >
                            Tu calificación
                        </div>
                        <div className="flex items-center gap-3">
                            <StarPicker rating={rating} onChange={setRating} />
                            {rating > 0 ? (
                                <div className="flex items-baseline gap-1.5">
                                    <span
                                        style={{
                                            fontSize: 17,
                                            fontWeight: 600,
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        {`${rating.toString()},0`}
                                    </span>
                                    <span
                                        className="text-[13px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        · {RATING_LABELS[rating]}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <label
                        className="block rounded-md border"
                        style={{ borderColor: 'var(--line)' }}
                    >
                        <span className="sr-only">Comentario</span>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder="Contanos cómo fue tu experiencia con este profesional..."
                            className="w-full resize-none bg-transparent px-4 py-3 text-[14px] leading-[1.55] outline-none"
                            style={{ color: 'var(--ink)' }}
                        />
                    </label>

                    {error ? (
                        <div
                            className="mt-3 rounded-md px-3 py-2 text-[12.5px]"
                            style={{
                                background: 'var(--danger-soft)',
                                color: 'var(--danger)',
                            }}
                        >
                            {error}
                        </div>
                    ) : null}

                    {success ? (
                        <div
                            className="mt-3 inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12.5px] font-semibold"
                            style={{
                                background: 'var(--success-soft)',
                                color: 'var(--success)',
                            }}
                        >
                            <Icon name="check" size={12} stroke="var(--success)" strokeWidth={2.5} />
                            Reseña publicada
                        </div>
                    ) : null}

                    <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2.5">
                            <Toggle
                                checked={recommends}
                                onChange={setRecommends}
                                ariaLabel="Recomendar este profesional"
                            />
                            <span
                                className="text-[13px] font-medium"
                                style={{ color: 'var(--ink)' }}
                            >
                                Recomendar este profesional
                            </span>
                        </div>

                        <Btn
                            type="submit"
                            variant="primary"
                            iconRight="send"
                            disabled={isPending || success}
                        >
                            {isPending ? 'Enviando…' : 'Publicar reseña'}
                        </Btn>
                    </div>
                </form>
            ) : null}
        </div>
    );
}
