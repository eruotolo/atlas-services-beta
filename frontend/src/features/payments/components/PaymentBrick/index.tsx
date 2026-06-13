'use client';
import { Btn } from '@/shared/components/hireeo';

import { useEffect, useState } from 'react';

import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from '@/shared/components/icons';

import { crearPagoPremium } from '../../actions';

interface PaymentBrickProps {
    servicioId: string;
    duracionMeses: number;
    precio: number;
    email?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PaymentBrick({
    servicioId,
    duracionMeses,
    precio,
    email,
    onSuccess,
    onCancel,
}: PaymentBrickProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [brickReady, setBrickReady] = useState(false);

    useEffect(() => {
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

        if (!publicKey) {
            setError('Error de configuración: Public Key de Mercado Pago no encontrada');
            return;
        }

        try {
            initMercadoPago(publicKey, {
                locale: 'es-CL',
                advancedFraudPrevention: true,
            });

            setTimeout(() => {
                setBrickReady(true);
            }, 500);
        } catch (err: unknown) {
            console.error('Error al inicializar Mercado Pago:', err);
            setError('Error al inicializar el sistema de pagos');
        }
    }, []);

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
                <h2 className="mb-2 text-3xl font-black text-ink">
                    Confirmar Pago
                </h2>
                <p className="text-sub">
                    Ingresa los datos de tu tarjeta para continuar
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={24}
                            className="mt-1 shrink-0 text-red-600"
                        />
                        <div className="flex-1">
                            <h3 className="mb-2 font-bold text-red-900">
                                Error al Cargar Formulario de Pago
                            </h3>
                            <div className="text-sm whitespace-pre-line text-red-700">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 rounded-[2rem] border border-line bg-bg p-8">
                <h3 className="mb-4 text-lg font-black text-ink">
                    Resumen del Pedido
                </h3>

                <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-sub">Plan seleccionado:</span>
                        <span className="font-bold text-ink">
                            Premium {duracionMeses} {duracionMeses === 1 ? 'mes' : 'meses'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-sub">Precio por mes:</span>
                        <span className="font-bold text-ink">
                            ${Math.round(precio / duracionMeses).toLocaleString('es-CL')}
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-line pt-3">
                        <span className="font-bold text-ink">
                            Total a pagar:
                        </span>
                        <span className="text-2xl font-black text-brand">
                            ${precio.toLocaleString('es-CL')}
                        </span>
                    </div>
                </div>

                <div className="mb-6 rounded-xl bg-brand/5 p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2
                            size={20}
                            className="mt-0.5 shrink-0 text-brand"
                        />
                        <p className="text-sm font-medium text-brand-marino">
                            Tu servicio será destacado inmediatamente después del pago
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 rounded-[2rem] border border-line bg-bg p-8">
                <div className="mb-4 flex items-center gap-2">
                    <CreditCard size={24} className="text-brand" />
                    <h3 className="text-lg font-black text-ink">
                        Datos de Pago
                    </h3>
                </div>

                {!brickReady && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2
                            size={32}
                            className="animate-spin text-brand"
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
                    <div className="mt-4 flex items-center justify-center gap-2 text-brand">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm font-medium">Procesando pago...</span>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <Btn variant="secondary" type="button" disabled={loading} onClick={onCancel}>Cancelar</Btn>
            </div>
        </div>
    );
}
