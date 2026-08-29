import { ACTORS } from './actors';
import { CONNECTIONS } from './connections';
import { ENTITIES } from './entities';
import { PROCESSES } from './processes';
import { SURFACES } from './surfaces';
import type { CatalogItem, LayerId, PerspectiveId, Process } from './types';

export { ACTORS, CONNECTIONS, ENTITIES, PROCESSES, SURFACES };
export type {
    Actor,
    CatalogItem,
    Connection,
    Entity,
    ItemStatus,
    LayerId,
    NodeKind,
    PerspectiveId,
    Process,
    ProcessStep,
    Protocol,
} from './types';

export const LAYER_LABELS: Record<LayerId, string> = {
    surfaces: 'Superficies',
    domain: 'Dominio',
    data: 'Datos',
    externals: 'Externos',
    connections: 'Conexiones',
};

export const PERSPECTIVE_META: Record<
    PerspectiveId,
    { title: string; kicker: string; description: string }
> = {
    home: {
        title: 'Mapa operativo',
        kicker: 'Hireeo',
        description: 'Elegí una perspectiva. El canvas muestra solo lo que esa persona toca.',
    },
    cliente: {
        title: 'Cliente',
        kicker: 'Perspectiva',
        description: 'Busca, ficha, chat, reseña, favorito y quotes.',
    },
    profesional: {
        title: 'Profesional',
        kicker: 'Perspectiva',
        description: 'Publica, paga Pro, cotiza leads y verifica KYC.',
    },
    admin: {
        title: 'Admin país',
        kicker: 'Perspectiva',
        description: 'Modera el catálogo scoped a su país.',
    },
    superadmin: {
        title: 'SuperAdmin',
        kicker: 'Perspectiva',
        description: 'Países, integraciones y catálogo global en /config.',
    },
    tecnica: {
        title: 'Capa técnica',
        kicker: 'Infra',
        description: 'proxy, Auth.js, apiClient, guards, Socket.IO, webhooks, Prisma.',
    },
};

export const DEFAULT_LAYERS: Record<LayerId, boolean> = {
    surfaces: true,
    domain: true,
    data: true,
    externals: true,
    connections: true,
};

export function processesFor(perspective: PerspectiveId): Process[] {
    if (perspective === 'home') {
        return [];
    }
    return PROCESSES.filter((process) => process.perspective === perspective);
}

export function findItem(id: string): CatalogItem | undefined {
    const surface: CatalogItem | undefined = SURFACES.find((item) => item.id === id);
    if (surface) {
        return surface;
    }
    const actor = ACTORS.find((item) => item.id === id);
    if (actor) {
        return {
            id: actor.id,
            kind: 'actor',
            title: actor.name,
            subtitle: actor.summary,
            path: 'roles en UserRole.countryId',
            status: 'live',
            layers: ['surfaces'],
            perspectives: [actor.perspective, 'tecnica'],
        };
    }
    const entity = ENTITIES.find((item) => item.id === id);
    if (entity) {
        return {
            id: entity.id,
            kind: 'entity',
            title: entity.title,
            subtitle: entity.subtitle,
            path: entity.path,
            status: entity.status,
            layers: ['data'],
            perspectives: entity.perspectives,
            note: entity.note,
        };
    }
    return undefined;
}
