export default function PrivacidadPage() {
    return (
        <section className="bg-background py-[100px]">
            <div className="container mx-auto max-w-4xl px-4">
                <h1 className="mb-8 text-4xl font-black text-gray-900 dark:text-white">
                    Política de Privacidad
                </h1>
                <div className="prose prose-blue max-w-none text-gray-900 dark:text-gray-300">
                    <p className="text-gray-500 italic dark:text-gray-400">
                        Última actualización: 14 de enero de 2026
                    </p>

                    <div className="mt-8 space-y-12">
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Responsable
                            </h2>
                            <p>
                                <strong>Chiloé Servicios</strong> (proyecto local de Castro, Chiloé)
                                es el responsable del tratamiento de tus datos personales.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Datos recolectados
                            </h2>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>
                                    <strong>Identificatorios:</strong> nombre, RUT (solo para
                                    facturación si aplica), correo electrónico, teléfono/WhatsApp.
                                </li>
                                <li>
                                    <strong>De servicio:</strong> comuna, categoría, descripción,
                                    fotos.
                                </li>
                                <li>
                                    <strong>Técnicos:</strong> dirección IP, tipo de dispositivo,
                                    cookies de sesión.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Finalidades
                            </h2>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>
                                    Publicar tu perfil (haciendo públicos nombre, teléfono y comuna
                                    para contacto directo de clientes).
                                </li>
                                <li>
                                    Gestionar cuentas, procesar pagos Premium y enviar
                                    notificaciones relevantes.
                                </li>
                                <li>Mejorar la seguridad y funcionalidad de la plataforma.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Base legal
                            </h2>
                            <p>
                                Consentimiento expreso al publicar o suscribirte, y cumplimiento de
                                la <strong>Ley 19.628 sobre Protección de la Vida Privada</strong>.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Compartición
                            </h2>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>
                                    Datos públicos (nombre, teléfono, comuna) se muestran en tu
                                    perfil.
                                </li>
                                <li>Correo electrónico permanece privado.</li>
                                <li>
                                    <strong>Pagos:</strong> procesados por Mercado Pago (no
                                    almacenamos datos de tarjetas).
                                </li>
                                <li>
                                    No vendemos ni compartimos datos para fines comerciales con
                                    terceros.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Tus derechos
                            </h2>
                            <p>
                                Puedes acceder, rectificar, cancelar o bloquear tus datos
                                escribiendo a{' '}
                                <span className="font-semibold text-brand dark:text-brand-light">
                                    privacidad@atlasservicios.com
                                </span>{' '}
                                o desde tu configuración de cuenta.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Seguridad
                            </h2>
                            <p>
                                Usamos encriptación SSL y medidas técnicas adecuadas. Ningún sistema
                                es 100% seguro, pero protegemos tus datos al máximo.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Cookies
                            </h2>
                            <p>Solo cookies esenciales de sesión para mantenerte logueado.</p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Conservación
                            </h2>
                            <p>
                                Conservamos los datos mientras tu cuenta esté activa y hasta 12
                                meses después de su eliminación (por obligaciones legales o
                                resolución de disputas). Puedes solicitar eliminación anticipada.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Contacto
                            </h2>
                            <p>
                                <span className="font-semibold text-brand dark:text-brand-light">
                                    privacidad@atlasservicios.com
                                </span>
                            </p>
                        </section>
                    </div>

                    <section className="dark:bg-muted mt-12 rounded-3xl border border-gray-100 bg-gray-50 p-8 dark:border-white/10">
                        <p className="text-center text-base font-medium text-gray-700 dark:text-gray-300">
                            Tu confianza es importante para nosotros.{' '}
                            <span className="font-bold">Gracias por usar Chiloé Servicios.</span>
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
}
