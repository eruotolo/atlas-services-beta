'use client';

import { type ReactElement, useEffect, useRef, useState } from 'react';

import { useParams, useRouter, usePathname } from 'next/navigation';

import { detectarServicio, type DetectarServicioResult } from '@/features/chatbot/actions';
import { Btn, Icon } from '@/shared/components/hireeo';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Paso = 'inicio' | 'geolocalizando' | 'sinProveedores';

interface Coords {
    lat: number;
    lng: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function buildBuscarUrl(country: string, categoriaNombre: string, coords?: Coords): string {
    const params = new URLSearchParams({ c: categoriaNombre });
    if (coords) {
        params.set('lat', String(coords.lat));
        params.set('lng', String(coords.lng));
    }
    return `/${country}/search?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/*  CuerpoInicio                                                        */
/* ------------------------------------------------------------------ */

interface CuerpoInicioProps {
    mensaje: string;
    cargando: boolean;
    error: string | null;
    country: string;
    onMensaje: (v: string) => void;
    onEnviar: () => void;
    onCerrar: () => void;
}

function CuerpoInicio({
    mensaje,
    cargando,
    error,
    country,
    onMensaje,
    onEnviar,
    onCerrar,
}: CuerpoInicioProps): ReactElement {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon name="sparkle" size={15} className="text-blue-500" />
                    <span className="text-[13px] font-semibold text-gray-800">
                        Asistente Hireeo
                    </span>
                </div>
                <button
                    type="button"
                    onClick={onCerrar}
                    aria-label="Cerrar asistente"
                    className="text-gray-400 transition-colors hover:text-gray-600"
                >
                    <Icon name="x" size={15} />
                </button>
            </div>

            <p className="text-[12px] text-gray-500">
                Describí lo que necesitás y te encontramos el profesional ideal.
            </p>

            <textarea
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-[13px] text-gray-800 placeholder:text-gray-400 transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                rows={3}
                placeholder="Ej: &ldquo;Se me rompió una cañería y hay agua por todos lados…&rdquo;"
                value={mensaje}
                onChange={(e) => onMensaje(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onEnviar();
                }}
                disabled={cargando}
                maxLength={500}
            />

            {error ? (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-[12px] text-red-600">
                    <Icon name="alert" size={13} className="mt-0.5 shrink-0" />
                    <span>
                        {error}{' '}
                        <a
                            href={`/${country}/search`}
                            className="underline hover:no-underline"
                        >
                            Buscar manualmente
                        </a>
                    </span>
                </div>
            ) : null}

            <Btn
                variant="accent"
                size="sm"
                icon="search"
                onClick={onEnviar}
                disabled={cargando || mensaje.trim().length < 3}
                className="self-end"
            >
                {cargando ? 'Analizando…' : 'Buscar servicio'}
            </Btn>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  CuerpoGeolocalizando                                               */
/* ------------------------------------------------------------------ */

interface CuerpoGeolocalizandoProps {
    deteccion: DetectarServicioResult;
    geoError: boolean;
    country: string;
    onFallback: () => void;
    onReiniciar: () => void;
}

function CuerpoGeolocalizando({
    deteccion,
    geoError,
    country,
    onFallback,
    onReiniciar,
}: CuerpoGeolocalizandoProps): ReactElement {
    return (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex items-center gap-2">
                <Icon name="sparkle" size={15} className="text-blue-500" />
                <span className="text-[13px] font-semibold text-gray-800">Asistente Hireeo</span>
            </div>

            {geoError ? (
                <>
                    <Icon name="alert" size={22} className="text-amber-400" />
                    <p className="text-[12px] text-gray-600">
                        No pudimos obtener tu ubicación. Te mostramos resultados generales.
                    </p>
                    <div className="flex gap-2">
                        <Btn variant="accent" size="sm" onClick={onFallback}>
                            Buscar sin ubicación
                        </Btn>
                        <Btn variant="ghost" size="sm" icon="refresh" onClick={onReiniciar}>
                            Volver
                        </Btn>
                    </div>
                </>
            ) : (
                <>
                    <div className="mt-1 h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                    <p className="text-[13px] font-medium text-gray-700">
                        Encontramos un{' '}
                        <span className="text-blue-600">{deteccion.categoriaNombre}</span>
                    </p>
                    {deteccion.mensaje ? (
                        <p className="rounded-lg bg-blue-50 px-3 py-2 text-[12px] italic text-blue-700">
                            {deteccion.mensaje}
                        </p>
                    ) : null}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Icon name="pin" size={11} />
                        <span>Obteniendo tu ubicación…</span>
                    </div>
                    <a
                        href={`/${country}/search?c=${encodeURIComponent(deteccion.categoriaNombre ?? '')}`}
                        className="text-[11px] text-gray-400 underline hover:text-gray-600 hover:no-underline"
                    >
                        Ir sin ubicación
                    </a>
                </>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  CuerpoSinProveedores                                               */
/* ------------------------------------------------------------------ */

interface CuerpoSinProveedoresProps {
    deteccion: DetectarServicioResult;
    country: string;
    onUsarOtros: () => void;
    onReiniciar: () => void;
}

function CuerpoSinProveedores({
    deteccion,
    country,
    onUsarOtros,
    onReiniciar,
}: CuerpoSinProveedoresProps): ReactElement {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Icon name="sparkle" size={15} className="text-blue-500" />
                <span className="text-[13px] font-semibold text-gray-800">Asistente Hireeo</span>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-[12px] text-amber-700">
                <p className="font-medium">Sin resultados por ahora</p>
                <p className="mt-0.5">
                    No encontramos proveedores de{' '}
                    <span className="font-semibold">{deteccion.categoriaNombre}</span> disponibles
                    todavía.
                </p>
            </div>
            <div className="flex flex-col gap-2">
                {deteccion.otrosNombre ? (
                    <Btn variant="secondary" size="sm" icon="search" onClick={onUsarOtros}>
                        Ver categoría {deteccion.otrosNombre}
                    </Btn>
                ) : null}
                <Btn variant="secondary" size="sm" href={`/${country}/search`}>
                    Buscar manualmente
                </Btn>
                <Btn variant="ghost" size="sm" icon="refresh" onClick={onReiniciar}>
                    Empezar de nuevo
                </Btn>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  ChatbotWidget                                                       */
/* ------------------------------------------------------------------ */

export function ChatbotWidget(): ReactElement | null {
    const params = useParams();
    const pathname = usePathname();
    const country = (params?.country as string) ?? 'cl';
    const router = useRouter();

    // Si estamos en la página de búsqueda o detalle del servicio, ocultar este widget
    if (pathname?.includes('/search') || pathname?.includes('/service')) {
        return null;
    }

    const [abierto, setAbierto] = useState(false);
    const [paso, setPaso] = useState<Paso>('inicio');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deteccion, setDeteccion] = useState<DetectarServicioResult | null>(null);
    const [geoError, setGeoError] = useState(false);

    const iniciarGeolocalizacion = (categoriaNombre: string) => {
        if (!('geolocation' in navigator)) {
            router.push(buildBuscarUrl(country, categoriaNombre));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: Coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                router.push(buildBuscarUrl(country, categoriaNombre, coords));
            },
            (err) => {
                console.warn('Geolocalización rechazada o fallida', err);
                setGeoError(true);
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    };

    const reiniciar = (): void => {
        setPaso('inicio');
        setMensaje('');
        setError(null);
        setDeteccion(null);
        setGeoError(false);
        setCargando(false);
    };

    const handleEnviar = async (): Promise<void> => {
        if (mensaje.trim().length < 3) return;
        setCargando(true);
        setError(null);

        const result = await detectarServicio(mensaje.trim(), country);
        setCargando(false);

        if (!result.success || result.error) {
            setError(result.error ?? 'No pude identificar el servicio. Intenta de nuevo.');
            return;
        }

        setDeteccion(result);

        if (result.sinProveedores) {
            setPaso('sinProveedores');
        } else {
            setPaso('geolocalizando');
            iniciarGeolocalizacion(result.categoriaNombre!);
        }
    };

    const handleUsarOtros = (): void => {
        const otrosNombre = deteccion?.otrosNombre;
        if (!otrosNombre || !deteccion) return;
        setDeteccion({ ...deteccion, categoriaNombre: otrosNombre, sinProveedores: false });
        setGeoError(false);
        setPaso('geolocalizando');
        iniciarGeolocalizacion(otrosNombre);
    };

    const handleFallback = (): void => {
        if (deteccion?.categoriaNombre) {
            router.push(buildBuscarUrl(country, deteccion.categoriaNombre));
        }
    };

    if (!abierto) {
        return (
            <button
                type="button"
                onClick={() => setAbierto(true)}
                aria-label="Abrir asistente de Hireeo"
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
                <Icon name="sparkle" size={22} className="text-white" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-gray-200">
            {paso === 'inicio' && (
                <CuerpoInicio
                    mensaje={mensaje}
                    cargando={cargando}
                    error={error}
                    country={country}
                    onMensaje={setMensaje}
                    onEnviar={() => {
                        void handleEnviar();
                    }}
                    onCerrar={() => setAbierto(false)}
                />
            )}
            {paso === 'geolocalizando' && deteccion ? (
                <CuerpoGeolocalizando
                    deteccion={deteccion}
                    geoError={geoError}
                    country={country}
                    onFallback={handleFallback}
                    onReiniciar={reiniciar}
                />
            ) : null}
            {paso === 'sinProveedores' && deteccion ? (
                <CuerpoSinProveedores
                    deteccion={deteccion}
                    country={country}
                    onUsarOtros={handleUsarOtros}
                    onReiniciar={reiniciar}
                />
            ) : null}
        </div>
    );
}
