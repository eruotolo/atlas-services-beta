import { useEffect, useMemo, type JSX } from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    ReactFlow,
    useReactFlow,
    type Node,
} from '@xyflow/react';
import { buildGraph } from '@/lib/buildGraph';
import { useMapState } from '@/state/MapState';
import { MapNode, type MapNodeData } from './nodes/MapNode';

const NODE_TYPES = { map: MapNode };

function FitOnMount(): null {
    const { fitView } = useReactFlow();
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fitView({ padding: 0.12, duration: 280 });
        }, 40);
        return () => window.clearTimeout(timer);
    }, [fitView]);
    return null;
}

export function MapCanvas(): JSX.Element {
    const { activeProcess, layers, stepIndex, selectedId, setSelectedId } = useMapState();

    const { nodes, edges } = useMemo(
        () => buildGraph(activeProcess, layers, stepIndex, selectedId),
        [activeProcess, layers, stepIndex, selectedId],
    );

    const token = `${activeProcess?.id ?? 'none'}:${stepIndex}:${Object.values(layers).join('')}`;

    return (
        <ReactFlow
            key={token}
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            onNodeClick={(_event, node: Node<MapNodeData>) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            fitView
            minZoom={0.4}
            maxZoom={1.6}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            defaultEdgeOptions={{
                type: 'smoothstep',
                style: { stroke: '#c8c8c8', strokeWidth: 1.4 },
            }}
        >
            <FitOnMount />
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#ebebeb" />
            <Controls
                position="top-right"
                showInteractive={false}
                className="!shadow-none !border-line !overflow-hidden !rounded-lg"
            />
        </ReactFlow>
    );
}
