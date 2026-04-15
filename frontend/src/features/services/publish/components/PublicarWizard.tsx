'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { Check } from 'lucide-react';

import PaymentBrickWrapper from '@/features/payments/components/PaymentBrickWrapper';
import { getServicioById } from '@/features/services/actions';

import Paso1DatosUsuario from './Paso1DatosUsuario';
import Paso2TuOficio from './Paso2TuOficio';
import Paso3NivelServicio from './Paso3NivelServicio';
import Paso4SeleccionarDuracion from './Paso4SeleccionarDuracion';
import Paso6Exito from './Paso6Exito';
import PasoExitoBasico from './PasoExitoBasico';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono?: string | null;
}

interface PublicarWizardProps {
    usuarioLogueado: Usuario | null;
}

export default function PublicarWizard({ usuarioLogueado }: PublicarWizardProps) {
    const searchParams = useSearchParams();
    const upgradeId = searchParams.get('upgrade');

    // Si hay upgradeId, empezamos en paso 4. Si hay usuario logueado, paso 2. Si no, paso 1.
    const [pasoActual, setPasoActual] = useState(upgradeId ? 4 : usuarioLogueado ? 2 : 1);
    const [datosUsuario, setDatosUsuario] = useState<Usuario | null>(usuarioLogueado);
    const [servicioCreado, setServicioCreado] = useState<string | null>(upgradeId);
    const [servicioSlug, setServicioSlug] = useState<string | null>(null);
    const [duracionSeleccionada, setDuracionSeleccionada] = useState<number | null>(null);
    const [precioSeleccionado, setPrecioSeleccionado] = useState<number | null>(null);

    // Sincronizar upgradeId si cambia
    useEffect(() => {
        if (upgradeId) {
            setServicioCreado(upgradeId);
            setPasoActual(4);

            // Obtener el slug del servicio para poder redireccionar si cancela
            getServicioById(upgradeId).then((service) => {
                if (service) {
                    setServicioSlug(service.slug);
                }
            });
        }
    }, [upgradeId]);

    function handleUsuarioVerificado(usuario: Usuario) {
        setDatosUsuario(usuario);
        setPasoActual(2);
    }

    function handleServicioCreado(servicioId: string, slug: string) {
        setServicioCreado(servicioId);
        setServicioSlug(slug);
        setPasoActual(3);
    }

    function handleSelectBasico() {
        // Si elige básico, mostrar pantalla de éxito (paso 3.5 invisible)
        setPasoActual(3.5);
    }

    function handleSelectPremium() {
        setPasoActual(4);
    }

    function handleDuracionSeleccionada(duracionMeses: number, precio: number) {
        setDuracionSeleccionada(duracionMeses);
        setPrecioSeleccionado(precio);
        setPasoActual(5);
    }

    function handlePagoExitoso() {
        setPasoActual(6);
    }

    function handleCancelarPago() {
        // El servicio ya está publicado como básico, mostrar pantalla de éxito básico
        setPasoActual(3.5);
    }

    const pasos = [
        { numero: 1, titulo: 'Tus Datos', completado: pasoActual > 1 },
        { numero: 2, titulo: 'Tu Oficio', completado: pasoActual > 2 },
        { numero: 3, titulo: 'Nivel', completado: pasoActual > 3 },
        { numero: 4, titulo: 'Duración', completado: pasoActual > 4 },
        { numero: 5, titulo: 'Pago', completado: pasoActual > 5 },
        { numero: 6, titulo: '¡Éxito!', completado: false },
    ];

    return (
        <div className="bg-background min-h-screen py-6 transition-colors duration-300 md:py-12">
            <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                {/* Progress Steps */}
                <div className="mb-8 md:mb-12">
                    <div className="flex items-center justify-between md:justify-center">
                        {pasos.map((paso, index) => (
                            <div key={paso.numero} className="flex items-center">
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all md:h-9 md:w-9 md:text-sm ${
                                        paso.completado
                                            ? 'bg-green-500 text-white'
                                            : paso.numero === pasoActual
                                              ? 'bg-brand text-white'
                                              : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600'
                                    }`}
                                >
                                    {paso.completado ? (
                                        <Check size={12} className="md:h-4 md:w-4" />
                                    ) : (
                                        paso.numero
                                    )}
                                </div>
                                <div className="ml-2 hidden text-left leading-none md:block">
                                    <p
                                        className={`text-[12px] font-black tracking-tighter whitespace-nowrap uppercase ${paso.numero === pasoActual ? 'text-brand dark:text-brand-light' : 'text-gray-600 dark:text-gray-500'}`}
                                    >
                                        Paso {paso.numero}
                                    </p>
                                    <p
                                        className={`mt-0.5 max-w-[90px] truncate text-[11px] font-bold whitespace-nowrap ${paso.numero === pasoActual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                    >
                                        {paso.titulo}
                                    </p>
                                </div>
                                {index < pasos.length - 1 && (
                                    <div
                                        className={`mx-1.5 h-0.5 w-3 sm:w-6 md:mx-4 md:w-16 ${paso.completado ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Título de paso actual solo para móvil */}
                    {Number.isInteger(pasoActual) && pasos[pasoActual - 1] && (
                        <div className="mt-4 text-center md:hidden">
                            <p className="text-xs font-black tracking-widest text-brand uppercase dark:text-brand-light">
                                Paso {pasoActual}: {pasos[pasoActual - 1].titulo}
                            </p>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:rounded-[2.5rem] md:p-12 dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
                    {pasoActual === 1 && <Paso1DatosUsuario onSuccess={handleUsuarioVerificado} />}
                    {pasoActual === 2 && datosUsuario && (
                        <Paso2TuOficio usuario={datosUsuario} onSuccess={handleServicioCreado} />
                    )}
                    {pasoActual === 3 && (
                        <Paso3NivelServicio
                            onSelectBasico={handleSelectBasico}
                            onSelectPremium={handleSelectPremium}
                        />
                    )}
                    {pasoActual === 3.5 && servicioSlug && <PasoExitoBasico slug={servicioSlug} />}
                    {pasoActual === 4 && (
                        <Paso4SeleccionarDuracion onSelect={handleDuracionSeleccionada} />
                    )}
                    {pasoActual === 5 &&
                        servicioCreado &&
                        duracionSeleccionada &&
                        precioSeleccionado && (
                            <PaymentBrickWrapper
                                servicioId={servicioCreado}
                                duracionMeses={duracionSeleccionada}
                                precio={precioSeleccionado}
                                email={datosUsuario?.email}
                                onSuccess={handlePagoExitoso}
                                onCancel={handleCancelarPago}
                            />
                        )}
                    {pasoActual === 6 && <Paso6Exito />}
                </div>
            </div>
        </div>
    );
}
