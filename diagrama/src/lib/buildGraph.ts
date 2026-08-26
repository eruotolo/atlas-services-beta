import type { Edge, Node } from '@xyflow/react';
import { CONNECTIONS, findItem, type LayerId, type Process } from '@/model';
import type { MapNodeData } from '@/app/canvas/nodes/MapNode';

const COL_W = 280;
const ROW_H = 118;
const ORIGIN_X = 48;
const ORIGIN_Y = 32;

function columnFor(id: string, kind: string): number {
    if (kind === 'actor') return 0;
    if (kind === 'route') return 1;
    if (kind === 'feature') return 2;
    if (kind === 'module') return 3;
    if (kind === 'entity') return 4;
    if (kind === 'external') return 5;
    if (id === 'infra.postgres' || id === 'infra.prisma') return 4;
    if (id === 'infra.guards' || id === 'infra.websocket' || id === 'infra.webhooks') return 3;
    return 2;
}

function layerVisible(id: string, layers: Record<LayerId, boolean>): boolean {
    const item = findItem(id);
    if (!item) {
        return false;
    }
    if (item.kind === 'actor') {
        return true;
    }
    return item.layers.some((layer) => layers[layer]);
}

function visibleIds(process: Process, layers: Record<LayerId, boolean>): string[] {
    const orderedIds: string[] = [];
    for (const step of process.steps) {
        for (const id of step.nodeIds) {
            if (!orderedIds.includes(id) && layerVisible(id, layers)) {
                orderedIds.push(id);
            }
        }
    }
    return orderedIds;
}

function edgeStyle(hot: boolean): Pick<Edge, 'style' | 'labelStyle' | 'animated'> {
    return {
        animated: hot,
        style: {
            stroke: hot ? '#2d4e8f' : '#d4d4d4',
            strokeWidth: hot ? 1.8 : 1.3,
        },
        labelStyle: { fill: hot ? '#2d4e8f' : '#767676', fontSize: 9 },
    };
}

function buildNodes(
    orderedIds: string[],
    hotIds: Set<string>,
    selectedId: string | null,
): Node<MapNodeData>[] {
    const columns = new Map<number, string[]>();
    for (const id of orderedIds) {
        const item = findItem(id);
        if (!item) continue;
        const col = columnFor(id, item.kind);
        const list = columns.get(col) ?? [];
        list.push(id);
        columns.set(col, list);
    }

    const nodes: Node<MapNodeData>[] = [];
    for (const [col, ids] of columns) {
        ids.forEach((id, row) => {
            const item = findItem(id);
            if (!item) return;
            const highlighted = hotIds.has(id);
            nodes.push({
                id,
                type: 'map',
                position: { x: ORIGIN_X + col * COL_W, y: ORIGIN_Y + row * ROW_H },
                data: {
                    kind: item.kind,
                    title: item.title,
                    subtitle: item.subtitle,
                    status: item.status,
                    path: item.path,
                    highlighted,
                    dimmed: !highlighted,
                    selected: selectedId === id,
                },
            });
        });
    }
    return nodes;
}

function catalogEdges(
    process: Process,
    visible: Set<string>,
    hotIds: Set<string>,
): Edge[] {
    return CONNECTIONS.filter(
        (connection) =>
            visible.has(connection.from) &&
            visible.has(connection.to) &&
            connection.perspectives.includes(process.perspective),
    ).map((connection) => ({
        id: connection.id,
        source: connection.from,
        target: connection.to,
        label: connection.label,
        ...edgeStyle(hotIds.has(connection.from) || hotIds.has(connection.to)),
    }));
}

function stepEdges(process: Process, visible: Set<string>, stepIndex: number, existing: Edge[]): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < process.steps.length - 1; i += 1) {
        const fromId = process.steps[i].nodeIds.find((id) => visible.has(id));
        const toId = process.steps[i + 1].nodeIds.find((id) => visible.has(id));
        if (!fromId || !toId || fromId === toId) {
            continue;
        }
        const already = existing.some((edge) => edge.source === fromId && edge.target === toId);
        if (already) {
            continue;
        }
        edges.push({
            id: `step-${process.steps[i].id}-${process.steps[i + 1].id}`,
            source: fromId,
            target: toId,
            label: String(i + 1),
            ...edgeStyle(i === stepIndex || i + 1 === stepIndex),
        });
    }
    return edges;
}

function buildEdges(
    process: Process,
    orderedIds: string[],
    hotIds: Set<string>,
    layers: Record<LayerId, boolean>,
    stepIndex: number,
): Edge[] {
    const visible = new Set(orderedIds);
    const catalog = layers.connections ? catalogEdges(process, visible, hotIds) : [];
    return [...catalog, ...stepEdges(process, visible, stepIndex, catalog)];
}

export function buildGraph(
    process: Process | null,
    layers: Record<LayerId, boolean>,
    stepIndex: number,
    selectedId: string | null,
): { nodes: Node<MapNodeData>[]; edges: Edge[] } {
    if (!process) {
        return { nodes: [], edges: [] };
    }

    const orderedIds = visibleIds(process, layers);
    const hotIds = new Set(process.steps[stepIndex]?.nodeIds ?? []);
    return {
        nodes: buildNodes(orderedIds, hotIds, selectedId),
        edges: buildEdges(process, orderedIds, hotIds, layers, stepIndex),
    };
}
