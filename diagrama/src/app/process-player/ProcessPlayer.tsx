import { useEffect, type JSX } from 'react';
import { cn } from '@/lib/cn';
import { useMapState } from '@/state/MapState';

function PlayIcon(): JSX.Element {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 1.6v8.8L10.2 6 3 1.6Z" fill="currentColor" />
        </svg>
    );
}

function PauseIcon(): JSX.Element {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <rect x="2.2" y="1.6" width="2.6" height="8.8" rx="0.4" fill="currentColor" />
            <rect x="7.2" y="1.6" width="2.6" height="8.8" rx="0.4" fill="currentColor" />
        </svg>
    );
}

export function ProcessPlayer(): JSX.Element {
    const {
        processes,
        activeProcess,
        activeProcessId,
        setActiveProcessId,
        stepIndex,
        goToStep,
        setSelectedId,
        isPlaying,
        togglePlay,
    } = useMapState();

    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (!activeProcess) return;
            if (event.key === ' ' || event.code === 'Space') {
                event.preventDefault();
                togglePlay();
                return;
            }
            if (event.key === 'ArrowRight') {
                goToStep(Math.min(activeProcess.steps.length - 1, stepIndex + 1));
            }
            if (event.key === 'ArrowLeft') {
                goToStep(Math.max(0, stepIndex - 1));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeProcess, goToStep, stepIndex, togglePlay]);

    if (!activeProcess) {
        return <aside className="w-[300px] shrink-0 border-r border-line bg-white" />;
    }

    const step = activeProcess.steps[stepIndex];
    const lastIndex = activeProcess.steps.length - 1;

    return (
        <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-line bg-white">
            <div className="border-b border-line px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Procesos</p>
                <h2 className="mt-1 font-serif text-[22px] italic text-ink">Flujo</h2>
            </div>
            <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2">
                {processes.map((process) => (
                    <button
                        key={process.id}
                        type="button"
                        onClick={() => setActiveProcessId(process.id)}
                        className={cn(
                            'shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em]',
                            process.id === activeProcessId
                                ? 'bg-ink text-white'
                                : 'bg-tint text-sub hover:text-ink',
                        )}
                    >
                        {process.title}
                    </button>
                ))}
            </div>
            <p className="border-b border-line px-5 py-3 text-[12px] leading-relaxed text-sub">
                {activeProcess.summary}
            </p>
            <ol className="flex-1 overflow-auto px-3 py-3">
                {activeProcess.steps.map((item, index) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            onClick={() => {
                                goToStep(index);
                                setSelectedId(item.nodeIds[0] ?? null);
                            }}
                            className={cn(
                                'mb-1 w-full rounded-lg px-3 py-2.5 text-left transition',
                                index === stepIndex ? 'bg-accent-soft' : 'hover:bg-tint',
                            )}
                        >
                            <span className="font-mono text-[10px] text-muted">
                                {String(index + 1).padStart(2, '0')} · {item.status}
                            </span>
                            <span className="mt-0.5 block text-[13px] font-medium text-ink">{item.label}</span>
                            {index === stepIndex ? (
                                <span className="mt-1.5 block text-[12px] leading-relaxed text-sub">
                                    {item.detail}
                                </span>
                            ) : null}
                        </button>
                    </li>
                ))}
            </ol>
            {step ? (
                <div className="border-t border-line px-5 py-4">
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            className="font-mono text-[11px] text-accent disabled:text-muted"
                            disabled={stepIndex === 0 || isPlaying}
                            onClick={() => goToStep(stepIndex - 1)}
                        >
                            ← anterior
                        </button>
                        <button
                            type="button"
                            onClick={togglePlay}
                            aria-label={isPlaying ? 'Pausar recorrido' : 'Reproducir recorrido'}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition',
                                isPlaying
                                    ? 'bg-accent-soft text-accent'
                                    : 'bg-ink text-white hover:bg-accent',
                            )}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            {isPlaying ? 'Pausar' : 'Play'}
                        </button>
                        <button
                            type="button"
                            className="font-mono text-[11px] text-accent disabled:text-muted"
                            disabled={stepIndex === lastIndex || isPlaying}
                            onClick={() => goToStep(stepIndex + 1)}
                        >
                            siguiente →
                        </button>
                    </div>
                    <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        {isPlaying ? 'reproduciendo' : 'espacio'} · {stepIndex + 1}/{activeProcess.steps.length}
                    </p>
                </div>
            ) : null}
        </aside>
    );
}
