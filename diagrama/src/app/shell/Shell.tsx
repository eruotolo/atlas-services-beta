import type { JSX } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { HomeView } from '@/app/canvas/HomeView';
import { MapCanvas } from '@/app/canvas/MapCanvas';
import { StepCaption } from '@/app/canvas/StepCaption';
import { Inspector } from '@/app/inspector/Inspector';
import { ProcessPlayer } from '@/app/process-player/ProcessPlayer';
import { useMapState } from '@/state/MapState';
import { LayerToggles } from './LayerToggles';
import { PerspectiveBar } from './PerspectiveBar';

export function Shell(): JSX.Element {
    const { perspective } = useMapState();

    return (
        <div className="flex h-full flex-col bg-bg">
            <PerspectiveBar />
            {perspective === 'home' ? (
                <HomeView />
            ) : (
                <>
                    <LayerToggles />
                    <div className="flex min-h-0 flex-1">
                        <ProcessPlayer />
                        <div className="relative min-w-0 flex-1">
                            <ReactFlowProvider>
                                <MapCanvas />
                            </ReactFlowProvider>
                            <StepCaption />
                        </div>
                        <Inspector />
                    </div>
                </>
            )}
        </div>
    );
}
