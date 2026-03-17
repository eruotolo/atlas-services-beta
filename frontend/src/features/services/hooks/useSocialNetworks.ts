import { useState } from 'react';

import type { RedSocial } from '../types/shared';

interface UseSocialNetworksReturn {
    redesSociales: RedSocial[];
    agregarRedSocial: () => void;
    actualizarRedSocial: (index: number, field: 'tipo' | 'url', value: string) => void;
    eliminarRedSocial: (index: number) => void;
}

export function useSocialNetworks(initialRedes: RedSocial[] = []): UseSocialNetworksReturn {
    const [redesSociales, setRedesSociales] = useState<RedSocial[]>(initialRedes);

    const agregarRedSocial = () => {
        setRedesSociales([...redesSociales, { tipo: 'WEBSITE', url: '' }]);
    };

    const actualizarRedSocial = (index: number, field: 'tipo' | 'url', value: string) => {
        const nuevasRedes = [...redesSociales];
        if (field === 'tipo') {
            nuevasRedes[index] = { ...nuevasRedes[index], tipo: value as RedSocial['tipo'] };
        } else {
            nuevasRedes[index] = { ...nuevasRedes[index], url: value };
        }
        setRedesSociales(nuevasRedes);
    };

    const eliminarRedSocial = (index: number) => {
        setRedesSociales(redesSociales.filter((_, i) => i !== index));
    };

    return {
        redesSociales,
        agregarRedSocial,
        actualizarRedSocial,
        eliminarRedSocial,
    };
}
