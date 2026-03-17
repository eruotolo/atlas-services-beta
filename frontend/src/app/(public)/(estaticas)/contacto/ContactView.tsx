'use client';

import type React from 'react';
import { useId, useState } from 'react';

import { AlertCircle, CheckCircle, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';

import { enviarFormularioContacto } from '@/features/contact/actions';

const ContactView: React.FC = () => {
    const nombreId = useId();
    const emailId = useId();
    const celularId = useId();
    const asuntoId = useId();
    const mensajeId = useId();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        celular: '',
        asunto: 'Suscripción Pro',
        mensaje: '',
    });

    const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [mensajeError, setMensajeError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEstado('loading');
        setMensajeError('');

        const resultado = await enviarFormularioContacto(formData);

        if (resultado.error) {
            setEstado('error');
            setMensajeError(resultado.error);
        } else {
            setEstado('success');
            setFormData({
                nombre: '',
                email: '',
                celular: '',
                asunto: 'Suscripción Pro',
                mensaje: '',
            });
            // Limpiar el mensaje de éxito después de 5 segundos
            setTimeout(() => setEstado('idle'), 5000);
        }
    };

    return (
        <section className="bg-background w-full py-10 md:py-20">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2">
                    <div>
                        <h1 className="mb-4 text-3xl leading-tight font-black text-gray-900 italic md:mb-6 md:text-5xl dark:text-white">
                            Hablemos de{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                tu próxima pega
                            </span>
                        </h1>
                        <p className="mb-8 text-base text-gray-500 md:mb-12 md:text-lg dark:text-gray-400">
                            Estamos aquí para ayudarte a resolver tus dudas o escuchar tus
                            sugerencias para mejorar nuestra isla.
                        </p>

                        <div className="space-y-6 md:space-y-8">
                            <div className="group flex items-center gap-4 md:gap-6">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 md:h-14 md:w-14 dark:bg-blue-900/20 dark:text-blue-400">
                                    <Mail size={20} className="md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                                        Correo
                                    </p>
                                    <p className="text-base font-bold break-all text-gray-900 md:text-lg md:break-normal dark:text-white">
                                        info@chiloeservicios.cl
                                    </p>
                                </div>
                            </div>
                            <a
                                href="https://wa.me/56929540906"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 transition-opacity hover:opacity-80 md:gap-6"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-transform group-hover:scale-110 md:h-14 md:w-14 dark:bg-green-900/20 dark:text-green-400">
                                    <Phone size={20} className="md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                                        WhatsApp Soporte
                                    </p>
                                    <p className="text-base font-bold text-gray-900 md:text-lg dark:text-white">
                                        +56 9 2954 0906
                                    </p>
                                </div>
                            </a>
                            <div className="group flex items-center gap-4 md:gap-6">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 transition-transform group-hover:scale-110 md:h-14 md:w-14 dark:bg-gray-800 dark:text-gray-400">
                                    <MapPin size={20} className="md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                                        Oficina
                                    </p>
                                    <p className="text-base font-bold text-gray-900 md:text-lg dark:text-white">
                                        Castro, Isla Grande de Chiloé
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-2xl shadow-blue-900/5 md:rounded-[2.5rem] md:p-10 dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label
                                        htmlFor={nombreId}
                                        className="text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        Tu Nombre
                                    </label>
                                    <input
                                        type="text"
                                        id={nombreId}
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej: Juan Pérez"
                                        required
                                        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-3.5 text-sm transition-all outline-none focus:border-blue-500 md:p-4 md:text-base dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label
                                        htmlFor={emailId}
                                        className="text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        Tu Correo
                                    </label>
                                    <input
                                        type="email"
                                        id={emailId}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ejemplo@correo.cl"
                                        required
                                        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-3.5 text-sm transition-all outline-none focus:border-blue-500 md:p-4 md:text-base dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label
                                    htmlFor={celularId}
                                    className="text-sm font-bold text-gray-700 dark:text-gray-300"
                                >
                                    Tu Celular
                                </label>
                                <input
                                    type="tel"
                                    id={celularId}
                                    name="celular"
                                    value={formData.celular}
                                    onChange={handleChange}
                                    placeholder="+56 9 1234 5678"
                                    required
                                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-3.5 text-sm transition-all outline-none focus:border-blue-500 md:p-4 md:text-base dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label
                                    htmlFor={asuntoId}
                                    className="text-sm font-bold text-gray-700 dark:text-gray-300"
                                >
                                    Asunto
                                </label>
                                <select
                                    id={asuntoId}
                                    name="asunto"
                                    value={formData.asunto}
                                    onChange={handleChange}
                                    required
                                    className="w-full appearance-none rounded-2xl border-2 border-gray-100 bg-gray-50 p-3.5 text-sm transition-all outline-none focus:border-blue-500 md:p-4 md:text-base dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
                                >
                                    <option className="dark:bg-gray-900">Suscripción Pro</option>
                                    <option className="dark:bg-gray-900">Quiero publicitar</option>
                                    <option className="dark:bg-gray-900">Reportar Usuario</option>
                                    <option className="dark:bg-gray-900">Soporte Técnico</option>
                                    <option className="dark:bg-gray-900">Otro</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label
                                    htmlFor={mensajeId}
                                    className="text-sm font-bold text-gray-700 dark:text-gray-300"
                                >
                                    Mensaje
                                </label>
                                <textarea
                                    id={mensajeId}
                                    name="mensaje"
                                    value={formData.mensaje}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="¿En qué podemos ayudarte?"
                                    required
                                    className="w-full resize-none rounded-2xl border-2 border-gray-100 bg-gray-50 p-3.5 text-sm transition-all outline-none focus:border-blue-500 md:p-4 md:text-base dark:border-white/5 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
                                />
                            </div>

                            {estado === 'error' && (
                                <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">{mensajeError}</p>
                                </div>
                            )}

                            {estado === 'success' && (
                                <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    <CheckCircle size={20} />
                                    <p className="text-sm font-medium">
                                        ¡Mensaje enviado con éxito! Te responderemos pronto.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={estado === 'loading'}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:text-lg dark:shadow-none"
                            >
                                {estado === 'loading' ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin md:h-5 md:w-5" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="md:h-5 md:w-5" />
                                        Enviar Mensaje
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactView;
