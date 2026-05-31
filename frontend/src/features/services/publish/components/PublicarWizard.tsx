'use client';

import { useEffect, useState, type ReactElement } from 'react';

import { useSearchParams } from 'next/navigation';

import PaymentBrickWrapper from '@/features/payments/components/PaymentBrickWrapper';
import { getServicioById } from '@/features/services/actions';
import { Card, Icon, Mono } from '@/shared/components/hireeo';

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

interface StepDef {
    numero: number;
    titulo: string;
    completado: boolean;
}

interface StepperItemProps {
    paso: StepDef;
    isActive: boolean;
    isLast: boolean;
}

function StepperItem({ paso, isActive, isLast }: StepperItemProps): ReactElement {
    const isDone = paso.completado;
    const bg = isDone ? 'var(--success)' : isActive ? 'var(--ink)' : 'var(--tint)';
    const color = isDone ? 'white' : isActive ? 'var(--bg)' : 'var(--sub)';
    return (
        <div className="flex items-center">
            <div className="flex items-center gap-2">
                <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold"
                    style={{ background: bg, color }}
                >
                    {isDone ? <Icon name="check" size={12} stroke="white" /> : paso.numero}
                </span>
                <div className="hidden leading-tight md:block">
                    <Mono
                        className="text-[9.5px] font-semibold"
                        style={{
                            color: isActive ? 'var(--accent)' : 'var(--muted)',
                            letterSpacing: '0.08em',
                        }}
                    >
                        PASO {paso.numero}
                    </Mono>
                    <div
                        className="text-[11.5px] font-semibold"
                        style={{ color: isActive ? 'var(--ink)' : 'var(--sub)' }}
                    >
                        {paso.titulo}
                    </div>
                </div>
            </div>
            {!isLast ? (
                <span
                    className="mx-2 h-px w-6 md:w-10"
                    style={{ background: isDone ? 'var(--success)' : 'var(--line)' }}
                />
            ) : null}
        </div>
    );
}

export default function PublicarWizard({ usuarioLogueado }: PublicarWizardProps): ReactElement {
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
        <div className="flex flex-col gap-6">
            <Card padding={20}>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {pasos.map((paso, index) => (
                        <StepperItem
                            key={paso.numero}
                            paso={paso}
                            isActive={paso.numero === pasoActual}
                            isLast={index === pasos.length - 1}
                        />
                    ))}
                </div>
                {Number.isInteger(pasoActual) && pasos[pasoActual - 1] ? (
                    <div className="mt-4 text-center md:hidden">
                        <Mono
                            className="text-[10.5px] font-semibold"
                            style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}
                        >
                            PASO {pasoActual} · {pasos[pasoActual - 1].titulo.toUpperCase()}
                        </Mono>
                    </div>
                ) : null}
            </Card>

            <Card padding={32}>
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
            </Card>
        </div>
    );
}
