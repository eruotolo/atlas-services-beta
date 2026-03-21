'use client';

import { useEffect, useState } from 'react';

import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from 'lucide-react';

import { crearPagoPremium } from '../actions';

const MP_LOCALE_MAP: Record<string, 'es-CL' | 'es-AR' | 'es-UY' | 'es-MX'> = {
    cl: 'es-CL',
    ar: 'es-AR',
    uy: 'es-UY',
};

const MP_KEY_MAP: Record<string, string | undefined> = {
    cl: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY_CL,
    ar: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY_AR,
    uy: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY_UY,
};

interface PaymentBrickMPProps {
    servicioId: string;
    duracionMeses: number;
    precio: number;
    currency: string;
    countryCode: string;
    email?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PaymentBrickMP({
    servicioId,
    duracionMeses,
    precio,
    countryCode,
    email,
    onSuccess,
    onCancel,
}: PaymentBrickMPProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [brickReady, setBrickReady] = useState(false);

    useEffect(() => {
        const publicKey =
            MP_KEY_MAP[countryCode] ?? process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

        if (!publicKey) {
            setError('Error de configuración: Public Key de Mercado Pago no encontrada');
            return;
        }

        try {
            initMercadoPago(publicKey, {
                locale: MP_LOCALE_MAP[countryCode] ?? 'es-CL',
                advancedFraudPrevention: true,
            });

            setTimeout(() => setBrickReady(true), 500);
        } catch (err: unknown) {
            console.error('Error al inicializar Mercado Pago:', err);
            setError('Error al inicializar el sistema de pagos');
        }
    }, [countryCode]);

    // biome-ignore lint/suspicious/noExplicitAny: Integración con MercadoPago SDK requiere any
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Lógica de pago compleja necesaria
    async function handleSubmit(param: any) {
        setLoading(true);
        setError('');

        try {
            const formData = param.formData || param;
            const payerEmail = formData.payer?.email || email || '';
            const identificationType = formData.payer?.identification?.type || 'RUT';
            const identificationNumber = formData.payer?.identification?.number;

            if (!formData.token) {
                setError('No se pudo generar el token de seguridad.');
                setLoading(false);
                return;
            }

            const result = await crearPagoPremium({
                servicioId,
                duracionMeses,
                paymentData: {
                    token: formData.token,
                    payment_method_id: formData.payment_method_id,
                    issuer_id: String(formData.issuer_id || ''),
                    installments: formData.installments || 1,
                    payer: {
                        email: payerEmail,
                        identification: {
                            type: identificationType,
                            number: String(identificationNumber || ''),
                        },
                    },
                },
            });

            if (result.error) {
                const detail =
                    (result as { statusDetail?: string }).statusDetail ||
                    (result as { details?: string }).details;
                setError(detail ? `${result.error} (${detail})` : result.error);
                setLoading(false);
            } else if (result.success) {
                onSuccess();
            } else {
                setError('No recibimos confirmación clara. Revisa tu perfil.');
                setLoading(false);
            }
        } catch (err: unknown) {
            console.error('Error en handleSubmit:', err);
            setError('Error al procesar el pago. Por favor intenta nuevamente.');
            setLoading(false);
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: Integración con MercadoPago SDK requiere any
    function handleError(error: any) {
        if (error?.type === 'non_critical') return;
        const errorMessage = error?.message || 'Error al cargar el formulario de pago.';
        setError(errorMessage);
    }

    return (
        <div>
            <div className="mb-8 text-center">
                <h2 className="mb-2 text-3xl font-black text-gray-900 dark:text-white">
                    Confirmar Pago
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Ingresa los datos de tu tarjeta para continuar
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={24}
                            className="mt-1 shrink-0 text-red-600 dark:text-red-400"
                        />
                        <div className="flex-1">
                            <h3 className="mb-2 font-bold text-red-900 dark:text-red-300">
                                Error al Cargar Formulario de Pago
                            </h3>
                            <div className="text-sm whitespace-pre-line text-red-700 dark:text-red-400">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 rounded-[2rem] border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-xl">
                <h3 className="mb-4 text-lg font-black text-gray-900 dark:text-white">
                    Resumen del Pedido
                </h3>
                <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Plan seleccionado:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                            Premium {duracionMeses} {duracionMeses === 1 ? 'mes' : 'meses'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Precio por mes:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                            ${Math.round(precio / duracionMeses).toLocaleString('es-CL')}
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3 dark:border-white/5">
                        <span className="font-bold text-gray-900 dark:text-white">
                            Total a pagar:
                        </span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            ${precio.toLocaleString('es-CL')}
                        </span>
                    </div>
                </div>
                <div className="mb-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex items-start gap-3">
                        <CheckCircle2
                            size={20}
                            className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
                        />
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            Tu servicio será destacado inmediatamente después del pago
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 rounded-[2rem] border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-gray-900/40">
                <div className="mb-4 flex items-center gap-2">
                    <CreditCard size={24} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                        Datos de Pago
                    </h3>
                </div>

                {!brickReady && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2
                            size={32}
                            className="animate-spin text-blue-600 dark:text-blue-400"
                        />
                    </div>
                )}

                {brickReady && (
                    <div className="payment-brick-container">
                        <Payment
                            initialization={{ amount: precio }}
                            customization={{
                                visual: {},
                                paymentMethods: {
                                    creditCard: 'all',
                                    debitCard: 'all',
                                    maxInstallments: 1,
                                },
                            }}
                            onSubmit={handleSubmit}
                            onError={handleError}
                        />
                    </div>
                )}

                {loading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm font-medium">Procesando pago...</span>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 cursor-pointer rounded-2xl border border-gray-200 px-6 py-4 font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
