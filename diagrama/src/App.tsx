import type { JSX } from 'react';
import { Shell } from '@/app/shell/Shell';
import { MapStateProvider } from '@/state/MapState';

export function App(): JSX.Element {
    return (
        <MapStateProvider>
            <Shell />
        </MapStateProvider>
    );
}
