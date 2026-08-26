import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type JSX,
    type ReactNode,
} from 'react';
import {
    DEFAULT_LAYERS,
    processesFor,
    type LayerId,
    type PerspectiveId,
    type Process,
} from '@/model';

export const STEP_DURATION_MS = 3200;

interface MapStateValue {
    perspective: PerspectiveId;
    setPerspective: (next: PerspectiveId) => void;
    layers: Record<LayerId, boolean>;
    toggleLayer: (layer: LayerId) => void;
    processes: Process[];
    activeProcessId: string | null;
    setActiveProcessId: (id: string) => void;
    activeProcess: Process | null;
    stepIndex: number;
    goToStep: (index: number) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    isPlaying: boolean;
    togglePlay: () => void;
    pause: () => void;
}

const MapStateContext = createContext<MapStateValue | null>(null);

const PERSPECTIVES: PerspectiveId[] = [
    'home',
    'cliente',
    'profesional',
    'admin',
    'superadmin',
    'tecnica',
];

function parseHash(): PerspectiveId {
    const raw = window.location.hash.replace('#', '');
    return PERSPECTIVES.includes(raw as PerspectiveId) ? (raw as PerspectiveId) : 'home';
}

function firstProcessId(perspective: PerspectiveId): string | null {
    return processesFor(perspective)[0]?.id ?? null;
}

export function MapStateProvider({ children }: { children: ReactNode }): JSX.Element {
    const [perspective, setPerspectiveState] = useState<PerspectiveId>(parseHash);
    const [layers, setLayers] = useState<Record<LayerId, boolean>>(DEFAULT_LAYERS);
    const [activeProcessId, setActiveProcessIdState] = useState<string | null>(null);
    const [stepIndex, setStepIndex] = useState<number>(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const processes: Process[] = useMemo(() => processesFor(perspective), [perspective]);

    const pause = useCallback((): void => {
        setIsPlaying(false);
    }, []);

    const setPerspective = useCallback((next: PerspectiveId): void => {
        setPerspectiveState(next);
        setActiveProcessIdState(firstProcessId(next));
        setStepIndex(0);
        setSelectedId(null);
        setIsPlaying(false);
        window.location.hash = next === 'home' ? '' : next;
    }, []);

    useEffect(() => {
        const onHashChange = (): void => {
            const next = parseHash();
            setPerspectiveState(next);
            setActiveProcessIdState(firstProcessId(next));
            setStepIndex(0);
            setSelectedId(null);
            setIsPlaying(false);
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    const setActiveProcessId = useCallback((id: string): void => {
        setActiveProcessIdState(id);
        setStepIndex(0);
        setSelectedId(null);
        setIsPlaying(false);
    }, []);

    const goToStep = useCallback((index: number): void => {
        setIsPlaying(false);
        setStepIndex(index);
    }, []);

    const toggleLayer = useCallback((layer: LayerId): void => {
        setLayers((current) => ({ ...current, [layer]: !current[layer] }));
    }, []);

    const activeProcess: Process | null = useMemo(() => {
        if (!activeProcessId) {
            return processes[0] ?? null;
        }
        return processes.find((process) => process.id === activeProcessId) ?? processes[0] ?? null;
    }, [activeProcessId, processes]);

    const togglePlay = useCallback((): void => {
        if (isPlaying) {
            setIsPlaying(false);
            return;
        }
        if (!activeProcess) {
            return;
        }
        const lastIndex = activeProcess.steps.length - 1;
        if (stepIndex >= lastIndex) {
            setStepIndex(0);
        }
        setSelectedId(null);
        setIsPlaying(true);
    }, [isPlaying, activeProcess, stepIndex]);

    useEffect(() => {
        if (!isPlaying || !activeProcess) {
            return;
        }
        const lastIndex = activeProcess.steps.length - 1;
        const timer = window.setTimeout(() => {
            if (stepIndex >= lastIndex) {
                setIsPlaying(false);
                return;
            }
            setStepIndex(stepIndex + 1);
        }, STEP_DURATION_MS);
        return () => window.clearTimeout(timer);
    }, [isPlaying, stepIndex, activeProcess]);

    const value: MapStateValue = {
        perspective,
        setPerspective,
        layers,
        toggleLayer,
        processes,
        activeProcessId: activeProcess?.id ?? null,
        setActiveProcessId,
        activeProcess,
        stepIndex,
        goToStep,
        selectedId,
        setSelectedId,
        isPlaying,
        togglePlay,
        pause,
    };

    return <MapStateContext.Provider value={value}>{children}</MapStateContext.Provider>;
}

export function useMapState(): MapStateValue {
    const ctx = useContext(MapStateContext);
    if (!ctx) {
        throw new Error('useMapState must be used inside MapStateProvider');
    }
    return ctx;
}
