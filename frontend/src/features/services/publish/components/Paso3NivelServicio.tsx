'use client';

import { Check, Sparkles, Star } from 'lucide-react';

interface Paso3NivelServicioProps {
    onSelectBasico: () => void;
    onSelectPremium: () => void;
}

export default function Paso3NivelServicio({
    onSelectBasico,
    onSelectPremium,
}: Paso3NivelServicioProps) {
    return (
        <div>
            <div className="mb-6 text-center md:mb-8">
                <h2 className="mb-1 text-2xl font-black text-ink md:text-3xl">
                    Elige el Nivel de tu Servicio
                </h2>
                <p className="px-2 text-sm text-sub md:text-base">
                    ¿Deseas publicar tu servicio de manera básica o destacar sobre la competencia
                    con Premium?
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {/* Plan BASICO */}
                <div className="rounded-[1.5rem] border-2 border-line bg-bg p-6 transition-all hover:border-line md:rounded-[2rem] md:p-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint md:h-12 md:w-12">
                            <Star size={20} className="text-muted" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-ink uppercase md:text-xl">
                                Básico
                            </h3>
                            <p className="text-xs font-bold text-muted">
                                SIEMPRE GRATIS
                            </p>
                        </div>
                    </div>

                    <ul className="mb-6 space-y-2.5">
                        <li className="flex items-start gap-2 text-sm text-sub">
                            <Check
                                size={16}
                                className="mt-0.5 shrink-0 text-muted"
                            />
                            <span>Aparece en los listados normales</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-sub">
                            <Check
                                size={16}
                                className="mt-0.5 shrink-0 text-muted"
                            />
                            <span>Contacto telefónico directo</span>
                        </li>
                    </ul>

                    <button
                        type="button"
                        onClick={onSelectBasico}
                        className="w-full cursor-pointer rounded-2xl bg-ink px-6 py-4 text-sm font-black text-bg transition-opacity hover:opacity-90"
                    >
                        Publicar Gratis
                    </button>
                </div>

                {/* Plan PREMIUM */}
                <div className="dark:to-background relative overflow-hidden rounded-[1.5rem] border-2 border-brand bg-gradient-to-br from-brand/5/50 to-white p-6 shadow-xl shadow-brand/10 md:rounded-[2rem] md:p-8 dark:from-brand-marino/20">
                    <div className="absolute top-3 right-3">
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[8px] font-black tracking-widest text-white uppercase">
                            RECOMENDADO
                        </span>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand md:h-12 md:w-12">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-ink uppercase md:text-xl">
                                Premium
                            </h3>
                            <p className="text-xs font-bold text-brand uppercase">
                                Aumenta tus clientes
                            </p>
                        </div>
                    </div>

                    <ul className="mb-6 space-y-2.5">
                        <li className="flex items-start gap-2 text-sm text-ink">
                            <Check size={16} className="mt-0.5 shrink-0 text-brand" />
                            <span className="font-bold">Aparece destacado (Primer lugar)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-sub">
                            <Check size={16} className="mt-0.5 shrink-0 text-brand" />
                            <span>Sello de confianza Pro</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-sub">
                            <Check size={16} className="mt-0.5 shrink-0 text-brand" />
                            <span>Prioridad máxima en búsquedas</span>
                        </li>
                    </ul>

                    <button
                        type="button"
                        onClick={onSelectPremium}
                        className="btn-primary w-full cursor-pointer rounded-2xl px-6 py-4 text-sm"
                    >
                        Continuar con Premium ✨
                    </button>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-[10px] tracking-widest text-muted uppercase">
                    Puedes cambiar de nivel cuando quieras
                </p>
            </div>
        </div>
    );
}
