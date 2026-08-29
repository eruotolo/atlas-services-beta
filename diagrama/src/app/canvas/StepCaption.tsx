import type { JSX } from 'react';
import { cn } from '@/lib/cn';
import { STEP_DURATION_MS, useMapState } from '@/state/MapState';

export function StepCaption(): JSX.Element | null {
    const { activeProcess, stepIndex, isPlaying } = useMapState();
    const step = activeProcess?.steps[stepIndex];

    if (!activeProcess || !step) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-8">
            <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-line bg-white/92 shadow-[0_16px_50px_rgba(10,10,10,0.08)] backdrop-blur-md">
                {isPlaying ? (
                    <div className="h-[2px] bg-accent-soft">
                        <div
                            key={`${activeProcess.id}-${stepIndex}`}
                            className="hireeo-play-progress h-full bg-accent"
                            style={{ animationDuration: `${STEP_DURATION_MS}ms` }}
                        />
                    </div>
                ) : (
                    <div className="h-[2px] bg-hairline" />
                )}
                <div className="px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        {isPlaying ? 'reproduciendo' : 'paso'} {String(stepIndex + 1).padStart(2, '0')} /{' '}
                        {String(activeProcess.steps.length).padStart(2, '0')} · {step.status}
                    </p>
                    <p className="mt-1 font-serif text-[22px] italic leading-tight text-ink">{step.label}</p>
                    <p
                        className={cn(
                            'mt-2 text-[13px] leading-relaxed text-sub',
                            isPlaying ? 'text-ink' : '',
                        )}
                    >
                        {step.detail}
                    </p>
                </div>
            </div>
        </div>
    );
}
