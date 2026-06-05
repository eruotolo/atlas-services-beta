import { Globe, Plus, Trash2 } from 'lucide-react';

import { TIPOS_RED_SOCIAL } from '../../../lib/constants';
import type { RedSocial } from '../../../types/shared';

interface SocialNetworksInputProps {
    redesSociales: RedSocial[];
    onAgregar: () => void;
    onActualizar: (index: number, field: 'tipo' | 'url', value: string) => void;
    onEliminar: (index: number) => void;
    variant?: 'admin' | 'user';
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Renderizado condicional complejo
export default function SocialNetworksInput({
    redesSociales,
    onAgregar,
    onActualizar,
    onEliminar,
    variant = 'user',
}: SocialNetworksInputProps) {
    const isAdmin = variant === 'admin';

    return (
        <div className={isAdmin ? 'pt-2' : ''}>
            <div className={`${isAdmin ? 'mb-2' : 'mb-2'} flex items-center justify-between`}>
                <span
                    className={`block ${isAdmin ? 'text-xs font-black tracking-wider text-sub uppercase' : 'text-sm font-bold text-sub'}`}
                >
                    Redes Sociales / Sitio Web
                </span>
                <button
                    type="button"
                    onClick={onAgregar}
                    className={`flex items-center gap-1 rounded-lg bg-brand/5 px-${isAdmin ? '2' : '3'} py-${isAdmin ? '1' : '1.5'} text-${isAdmin ? '[10px]' : 'xs'} font-bold text-brand hover:bg-brand/10`}
                >
                    <Plus size={isAdmin ? 12 : 14} />
                    Agregar
                </button>
            </div>

            {redesSociales.length === 0 ? (
                <div
                    className={`rounded-${isAdmin ? 'xl' : '2xl'} border border-dashed border-line p-${isAdmin ? '4' : '6'} text-center`}
                >
                    <Globe
                        size={isAdmin ? 24 : 32}
                        className="mb-${isAdmin ? '1' : '2'} mx-auto text-muted"
                    />
                    <p className={`text-${isAdmin ? 'xs' : 'sm'} text-muted`}>
                        {isAdmin
                            ? 'Sin redes sociales agregadas'
                            : 'No has agregado redes sociales. ¡Agrega tu Instagram o sitio web para que te conozcan mejor!'}
                    </p>
                </div>
            ) : (
                <div className={`space-y-${isAdmin ? '2' : '3'}`}>
                    {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Renderizado necesario */}
                    {redesSociales.map((red, index) => {
                        return (
                            <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: Index necesario para onActualizar
                                key={index}
                                className="flex gap-2"
                            >
                                <select
                                    value={red.tipo}
                                    onChange={(e) => onActualizar(index, 'tipo', e.target.value)}
                                    className={`rounded-${isAdmin ? 'lg' : 'xl'} border border-line bg-bg px-${isAdmin ? '2' : '3'} py-${isAdmin ? '1.5' : '2'} text-${isAdmin ? 'xs' : 'sm'} text-sub focus:border-brand focus:outline-none`}
                                >
                                    {TIPOS_RED_SOCIAL.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="url"
                                    value={red.url}
                                    onChange={(e) => onActualizar(index, 'url', e.target.value)}
                                    placeholder="https://..."
                                    className={`flex-1 rounded-${isAdmin ? 'lg' : 'xl'} border border-line bg-bg px-${isAdmin ? '2' : '3'} py-${isAdmin ? '1.5' : '2'} text-${isAdmin ? 'xs' : 'sm'} text-ink focus:border-brand focus:outline-none`}
                                />
                                <button
                                    type="button"
                                    onClick={() => onEliminar(index)}
                                    className={`rounded-${isAdmin ? 'lg' : 'xl'} border border-line p-${isAdmin ? '1.5' : '2'} text-muted hover:bg-red-50 hover:text-red-600`}
                                >
                                    <Trash2 size={isAdmin ? 14 : 18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
