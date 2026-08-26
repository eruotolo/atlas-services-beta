import type { JSX } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/cn';
import type { ItemStatus, NodeKind } from '@/model';

export interface MapNodeData extends Record<string, unknown> {
    kind: NodeKind;
    title: string;
    subtitle: string;
    status: ItemStatus;
    path: string;
    highlighted: boolean;
    dimmed: boolean;
    selected: boolean;
}

const KIND_BAR: Record<NodeKind, string> = {
    actor: 'bg-accent',
    route: 'bg-ink',
    feature: 'bg-accent-bright',
    module: 'bg-success',
    infra: 'bg-muted',
    entity: 'bg-warning',
    external: 'bg-accent',
};

const KIND_LABEL: Record<NodeKind, string> = {
    actor: 'actor',
    route: 'ruta',
    feature: 'feature',
    module: 'módulo',
    infra: 'infra',
    entity: 'entidad',
    external: 'externo',
};

const STATUS_DOT: Record<ItemStatus, string> = {
    live: 'bg-success',
    mock: 'bg-warning',
    gap: 'bg-danger',
    'mobile-only': 'bg-accent-bright',
};

export function MapNode({ data }: NodeProps<Node<MapNodeData>>): JSX.Element {
    return (
        <div
            className={cn(
                'relative w-[228px] rounded-lg border bg-white shadow-[0_1px_0_rgba(10,10,10,0.04)] transition-all duration-200',
                data.selected ? 'border-accent ring-2 ring-accent-soft' : 'border-line',
                data.highlighted ? 'opacity-100' : '',
                data.dimmed && !data.selected ? 'opacity-[0.28]' : 'opacity-100',
            )}
        >
            <Handle type="target" position={Position.Left} className="!size-2 !border-line !bg-white" />
            <div className={cn('absolute inset-y-0 left-0 w-[3px] rounded-l-lg', KIND_BAR[data.kind])} />
            <div className="px-3 py-2.5 pl-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        {KIND_LABEL[data.kind]}
                    </span>
                    <span className={cn('size-1.5 rounded-full', STATUS_DOT[data.status])} />
                </div>
                <p className="mt-1 truncate text-[13px] font-medium leading-tight text-ink">{data.title}</p>
                <p className="mt-0.5 truncate text-[11px] leading-snug text-sub">{data.subtitle}</p>
            </div>
            <Handle type="source" position={Position.Right} className="!size-2 !border-line !bg-white" />
        </div>
    );
}
