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
                <h2 className="mb-1 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                    Elige el Nivel de tu Servicio
                </h2>
                <p className="px-2 text-sm text-gray-600 md:text-base dark:text-gray-400">
                    ¿Deseas publicar tu servicio de manera básica o destacar sobre la competencia
                    con Premium?
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {/* Plan BASICO */}
                <div className="rounded-[1.5rem] border-2 border-gray-100 bg-white p-6 transition-all hover:border-gray-200 md:rounded-[2rem] md:p-8 dark:border-white/10 dark:bg-gray-900/40 dark:hover:border-white/20">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 md:h-12 md:w-12 dark:bg-gray-800">
                            <Star size={20} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase md:text-xl dark:text-white">
                                Básico
                            </h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                                SIEMPRE GRATIS
                            </p>
                        </div>
                    </div>

                    <ul className="mb-6 space-y-2.5">
                        <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Check
                                size={16}
                                className="mt-0.5 shrink-0 text-gray-300 dark:text-gray-600"
                            />
                            <span>Aparece en los listados normales</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Check
                                size={16}
                                className="mt-0.5 shrink-0 text-gray-300 dark:text-gray-600"
                            />
                            <span>Contacto telefónico directo</span>
                        </li>
                    </ul>

                    <button
                        type="button"
                        onClick={onSelectBasico}
                        className="w-full cursor-pointer rounded-2xl bg-gray-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-gray-200 transition-colors hover:bg-gray-700 dark:bg-gray-800 dark:shadow-none dark:hover:bg-gray-700"
                    >
                        Publicar Gratis
                    </button>
                </div>

                {/* Plan PREMIUM */}
                <div className="dark:to-background relative overflow-hidden rounded-[1.5rem] border-2 border-blue-500 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-xl shadow-blue-100 md:rounded-[2rem] md:p-8 dark:border-blue-600 dark:from-blue-900/20 dark:shadow-none">
                    <div className="absolute top-3 right-3">
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[8px] font-black tracking-widest text-white uppercase">
                            RECOMENDADO
                        </span>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 md:h-12 md:w-12">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase md:text-xl dark:text-white">
                                Premium
                            </h3>
                            <p className="text-xs font-bold text-blue-600 uppercase dark:text-blue-400">
                                Aumenta tus clientes
                            </p>
                        </div>
                    </div>

                    <ul className="mb-6 space-y-2.5">
                        <li className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                            <Check size={16} className="mt-0.5 shrink-0 text-blue-500" />
                            <span className="font-bold">Aparece destacado (Primer lugar)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-900 dark:text-gray-300">
                            <Check size={16} className="mt-0.5 shrink-0 text-blue-500" />
                            <span>Sello de confianza Pro</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-900 dark:text-gray-300">
                            <Check size={16} className="mt-0.5 shrink-0 text-blue-500" />
                            <span>Prioridad máxima en búsquedas</span>
                        </li>
                    </ul>

                    <button
                        type="button"
                        onClick={onSelectPremium}
                        className="w-full cursor-pointer rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 dark:shadow-none"
                    >
                        Continuar con Premium ✨
                    </button>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-[10px] tracking-widest text-gray-400 uppercase dark:text-gray-600">
                    Puedes cambiar de nivel cuando quieras
                </p>
            </div>
        </div>
    );
}
