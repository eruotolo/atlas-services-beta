import type { JSX } from 'react';
import { findItem, PROCESSES } from '@/model';
import { useMapState } from '@/state/MapState';

const STATUS_COPY: Record<string, { label: string; hint: string }> = {
    live: { label: 'live', hint: 'Implementado y en uso.' },
    mock: { label: 'mock', hint: 'Existe el camino; la parte de negocio no está cerrada.' },
    gap: { label: 'gap', hint: 'Falta en esta superficie.' },
    'mobile-only': { label: 'mobile-only', hint: 'Vive en la app mobile / API, no en la web.' },
};

export function Inspector(): JSX.Element {
    const { selectedId, activeProcess, stepIndex, isPlaying } = useMapState();
    const item = selectedId ? findItem(selectedId) : undefined;
    const step = activeProcess?.steps[stepIndex];
    const usedIn = selectedId
        ? PROCESSES.filter((process) => process.steps.some((s) => s.nodeIds.includes(selectedId)))
        : [];

    if (!item) {
        return (
            <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-line bg-white">
                <div className="border-b border-line px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Inspector</p>
                    <h2 className="mt-1 font-serif text-[22px] italic text-ink">
                        {isPlaying ? 'Recorrido' : 'Sin selección'}
                    </h2>
                </div>
                <div className="px-5 py-4 text-[13px] leading-relaxed text-sub">
                    {step ? (
                        <>
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                                Paso {stepIndex + 1} · {step.status}
                            </p>
                            <p className="mt-2 font-medium text-ink">{step.label}</p>
                            <p className="mt-3">{step.detail}</p>
                        </>
                    ) : (
                        <p>Clickeá Play para ver el recorrido, o un nodo para su archivo.</p>
                    )}
                </div>
            </aside>
        );
    }

    const status = STATUS_COPY[item.status];

    return (
        <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-line bg-white">
            <div className="border-b border-line px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{item.kind}</p>
                <h2 className="mt-1 font-serif text-[22px] italic leading-tight text-ink">{item.title}</h2>
                <p className="mt-2 text-[13px] text-sub">{item.subtitle}</p>
            </div>
            <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 py-4 text-[13px]">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Estado</p>
                    <p className="mt-1 font-medium text-ink">{status.label}</p>
                    <p className="mt-1 text-sub">{status.hint}</p>
                </div>
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Archivo</p>
                    <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-ink">{item.path}</p>
                </div>
                {item.note ? (
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Decisión</p>
                        <p className="mt-1 leading-relaxed text-sub">{item.note}</p>
                    </div>
                ) : null}
                {usedIn.length > 0 ? (
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Procesos</p>
                        <ul className="mt-2 space-y-1 text-sub">
                            {usedIn.map((process) => (
                                <li key={process.id}>{process.title}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}
