import type { JSX } from 'react';
import { cn } from '@/lib/cn';
import { PERSPECTIVE_META, type PerspectiveId } from '@/model';
import { useMapState } from '@/state/MapState';

const TABS: PerspectiveId[] = ['home', 'cliente', 'profesional', 'admin', 'superadmin', 'tecnica'];

export function PerspectiveBar(): JSX.Element {
    const { perspective, setPerspective } = useMapState();

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-5">
            <button type="button" onClick={() => setPerspective('home')} className="flex items-baseline gap-2">
                <span className="font-serif text-[20px] italic text-ink">Hireeo</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">mapa</span>
            </button>
            <nav className="flex items-center gap-1">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setPerspective(tab)}
                        className={cn(
                            'rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition',
                            perspective === tab ? 'bg-ink text-white' : 'text-sub hover:bg-tint hover:text-ink',
                        )}
                    >
                        {tab === 'home' ? 'Portada' : PERSPECTIVE_META[tab].title}
                    </button>
                ))}
            </nav>
        </header>
    );
}
