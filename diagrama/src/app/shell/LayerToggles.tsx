import type { JSX } from 'react';
import { cn } from '@/lib/cn';
import { LAYER_LABELS, type LayerId } from '@/model';
import { useMapState } from '@/state/MapState';

const ORDER: LayerId[] = ['surfaces', 'domain', 'data', 'externals', 'connections'];

export function LayerToggles(): JSX.Element {
    const { layers, toggleLayer, perspective } = useMapState();

    if (perspective === 'home') {
        return <div />;
    }

    return (
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-tint px-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Capas</span>
            {ORDER.map((layer) => (
                <button
                    key={layer}
                    type="button"
                    onClick={() => toggleLayer(layer)}
                    className={cn(
                        'rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
                        layers[layer]
                            ? 'border-ink bg-white text-ink'
                            : 'border-transparent text-muted line-through',
                    )}
                >
                    {LAYER_LABELS[layer]}
                </button>
            ))}
        </div>
    );
}
