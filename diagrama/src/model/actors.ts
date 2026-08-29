import type { Actor } from './types';

export const ACTORS: Actor[] = [
    {
        id: 'actor.client',
        name: 'Cliente',
        summary: 'Busca, conversa, reseña, pide cotización y paga escrow.',
        perspective: 'cliente',
    },
    {
        id: 'actor.professional',
        name: 'Profesional',
        summary: 'Publica, sube a Pro, cotiza leads y verifica identidad.',
        perspective: 'profesional',
    },
    {
        id: 'actor.admin',
        name: 'Admin país',
        summary: 'Modera el catálogo scoped a su país.',
        perspective: 'admin',
    },
    {
        id: 'actor.superadmin',
        name: 'SuperAdmin',
        summary: 'Configura países, keys e integraciones globales.',
        perspective: 'superadmin',
    },
    {
        id: 'actor.mobile',
        name: 'App mobile',
        summary: 'Alta de ServiceRequest. Pega directo a Nest.',
        perspective: 'profesional',
    },
];
