'use client';

import { useEffect, useState } from 'react';

import { Check } from 'lucide-react';

import { obtenerPreciosPremiumActivos } from '@/features/payments/actions';

interface PrecioPremium {
    id: string;
    duracionMeses: number;
    precio: number;
    descripcion: string | null;
}

interface Paso4SeleccionarDuracionProps {
    onSelect: (duracionMeses: number, precio: number) => void;
}

export default function Paso4SeleccionarDuracion({ onSelect }: Paso4SeleccionarDuracionProps) {
    const [precios, setPrecios] = useState<PrecioPremium[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // biome-ignore lint/correctness/useExhaustiveDependencies: Solo ejecutar al montar
    useEffect(() => {
        cargarPrecios();
    }, []);

    async function cargarPrecios() {
        try {
            const result = await obtenerPreciosPremiumActivos();
            setPrecios(result);
        } catch (_err) {
            setError('Error al cargar precios');
        } finally {
            setLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, duracionMeses: number, precio: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(duracionMeses, precio);
        }
    };

    function calcularDescuento(precio: number, duracionMeses: number): number {
        const precioMensual = precio / duracionMeses;
        const precioBase = precios.find((p) => p.duracionMeses === 1)?.precio || 0;
        if (precioBase === 0) return 0;
        return Math.round(((precioBase - precioMensual) / precioBase) * 100);
    }

    if (loading) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500">Cargando opciones de pago...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 px-2 text-center md:mb-8">
                <h2 className="mb-1 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                    ¿Por Cuánto Tiempo?
                </h2>
                <p className="text-sm text-gray-600 md:text-base dark:text-gray-400">
                    Ahorra más con planes largos y mantén tu servicio destacado
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {precios.map((precio) => {
                    const descuento = calcularDescuento(precio.precio, precio.duracionMeses);
                    const precioPorMes = precio.precio / precio.duracionMeses;
                    const esRecomendado = precio.duracionMeses === 3;

                    return (
                        <button
                            key={precio.id}
                            type="button"
                            className={`relative w-full cursor-pointer rounded-[1.5rem] border-2 bg-white p-6 text-left shadow-sm transition-all md:hover:shadow-xl dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl ${
                                esRecomendado
                                    ? 'border-blue-600 shadow-blue-200 dark:border-blue-600'
                                    : 'border-gray-100 dark:border-white/10'
                            }`}
                            onClick={() => onSelect(precio.duracionMeses, precio.precio)}
                            onKeyDown={(e) => handleKeyDown(e, precio.duracionMeses, precio.precio)}
                        >
                            {esRecomendado && (
                                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                                    <span className="rounded-full bg-blue-600 px-3 py-0.5 text-[8px] font-black tracking-widest text-white uppercase shadow-lg">
                                        RECOMENDADO
                                    </span>
                                </div>
                            )}
                            {descuento > 0 && (
                                <div className="absolute top-3 right-3">
                                    <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-black text-white">
                                        -{descuento}%
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-xl font-black text-gray-900 md:text-2xl dark:text-white">
                                    {precio.duracionMeses}{' '}
                                    {precio.duracionMeses === 1 ? 'Mes' : 'Meses'}
                                </h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {precio.descripcion}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-2xl font-black text-blue-600 md:text-3xl dark:text-blue-400">
                                    ${precio.precio.toLocaleString('es-CL')}
                                </p>
                                <p className="text-xs font-bold tracking-tighter text-gray-400 uppercase dark:text-gray-500">
                                    ${Math.round(precioPorMes).toLocaleString('es-CL')}/mes
                                </p>
                            </div>

                            <ul className="mb-6 space-y-2">
                                <li className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Check
                                        size={14}
                                        className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
                                    />
                                    <span>Servicio destacado</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Check
                                        size={14}
                                        className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
                                    />
                                    <span>Badge Premium Chiloé</span>
                                </li>
                            </ul>

                            <div
                                className={`w-full rounded-xl px-4 py-3 text-center text-sm font-black tracking-widest uppercase transition-colors ${
                                    esRecomendado
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                Seleccionar
                            </div>
                        </button>
                    );
                })}
            </div>

            {precios.length === 0 && (
                <div className="py-12 text-center text-gray-500 dark:text-gray-500">
                    No hay planes premium disponibles en este momento
                </div>
            )}
        </div>
    );
}
