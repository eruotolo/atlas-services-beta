export type PerspectiveId =
    | 'home'
    | 'cliente'
    | 'profesional'
    | 'admin'
    | 'superadmin'
    | 'tecnica';

export type LayerId = 'surfaces' | 'domain' | 'data' | 'externals' | 'connections';

export type NodeKind = 'actor' | 'route' | 'feature' | 'module' | 'infra' | 'entity' | 'external';

export type ItemStatus = 'live' | 'mock' | 'gap' | 'mobile-only';

export type Protocol = 'https' | 'jwt' | 'api-key' | 'websocket' | 'webhook' | 'prisma' | 'sdk';

export interface Actor {
    id: string;
    name: string;
    summary: string;
    perspective: Exclude<PerspectiveId, 'home' | 'tecnica'>;
}

export interface CatalogItem {
    id: string;
    kind: NodeKind;
    title: string;
    subtitle: string;
    path: string;
    status: ItemStatus;
    layers: LayerId[];
    perspectives: PerspectiveId[];
    note?: string;
}

export interface Entity {
    id: string;
    title: string;
    subtitle: string;
    path: string;
    status: ItemStatus;
    perspectives: PerspectiveId[];
    note?: string;
}

export interface ProcessStep {
    id: string;
    label: string;
    detail: string;
    nodeIds: string[];
    status: ItemStatus;
}

export interface Process {
    id: string;
    title: string;
    summary: string;
    perspective: Exclude<PerspectiveId, 'home'>;
    steps: ProcessStep[];
}

export interface Connection {
    id: string;
    from: string;
    to: string;
    protocol: Protocol;
    label: string;
    perspectives: PerspectiveId[];
}
