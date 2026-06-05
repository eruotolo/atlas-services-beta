import type { ReactElement } from 'react';

import { ColorSection } from './_sections/ColorSection';
import { ComponentesSection } from './_sections/ComponentesSection';
import { EspaciadoSection } from './_sections/EspaciadoSection';
import { HeroSection } from './_sections/HeroSection';
import { IconografiaSection } from './_sections/IconografiaSection';
import { MarcaSection } from './_sections/MarcaSection';
import { TipografiaSection } from './_sections/TipografiaSection';
import { UsoSection } from './_sections/UsoSection';

export default function DesignSystemPage(): ReactElement {
    return (
        <>
            <HeroSection />
            <MarcaSection />
            <ColorSection />
            <TipografiaSection />
            <EspaciadoSection />
            <ComponentesSection />
            <IconografiaSection />
            <UsoSection />
        </>
    );
}
