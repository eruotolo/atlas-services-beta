import type { JSX } from 'react';
import { ACTORS, PERSPECTIVE_META } from '@/model';
import { useMapState } from '@/state/MapState';

const CARDS: Array<{
    id: 'cliente' | 'profesional' | 'admin' | 'superadmin' | 'tecnica';
    actorId?: string;
}> = [
    { id: 'cliente', actorId: 'actor.client' },
    { id: 'profesional', actorId: 'actor.professional' },
    { id: 'admin', actorId: 'actor.admin' },
    { id: 'superadmin', actorId: 'actor.superadmin' },
    { id: 'tecnica' },
];

export function HomeView(): JSX.Element {
    const { setPerspective } = useMapState();

    return (
        <div className="flex h-full overflow-auto bg-bg">
            <div className="mx-auto flex w-full max-w-[1080px] flex-col justify-center px-10 py-16">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Hireeo · beta</p>
                <h1 className="mt-3 font-serif text-5xl italic leading-none text-ink">Mapa operativo</h1>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-sub">
                    Una perspectiva a la vez. Clickeá un rol para ver su flujo, las piezas que toca y
                    el estado real del código: live, mock, gap o mobile-only.
                </p>

                <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {CARDS.map((card) => {
                        const meta = PERSPECTIVE_META[card.id];
                        const actor = ACTORS.find((item) => item.id === card.actorId);
                        return (
                            <button
                                key={card.id}
                                type="button"
                                onClick={() => setPerspective(card.id)}
                                className="group rounded-2xl border border-line bg-white p-5 text-left transition hover:border-accent hover:shadow-[0_12px_40px_rgba(45,78,143,0.08)]"
                            >
                                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                                    {meta.kicker}
                                </p>
                                <h2 className="mt-2 font-serif text-[28px] italic leading-none text-ink">
                                    {meta.title}
                                </h2>
                                <p className="mt-3 text-[13px] leading-relaxed text-sub">
                                    {actor?.summary ?? meta.description}
                                </p>
                                <span className="mt-5 inline-flex font-mono text-[11px] text-accent opacity-0 transition group-hover:opacity-100">
                                    abrir →
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
