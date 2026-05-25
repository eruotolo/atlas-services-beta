export default function TerminosPage() {
    return (
        <section className="bg-background py-[100px]">
            <div className="container mx-auto max-w-4xl px-4">
                <h1 className="mb-8 text-4xl font-black text-gray-900 dark:text-white">
                    Términos y Condiciones
                </h1>
                <div className="prose prose-blue max-w-none text-gray-900 dark:text-gray-300">
                    <p className="text-gray-500 italic dark:text-gray-400">
                        Última actualización: 14 de enero de 2026
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                1. Aceptación de los términos
                            </h2>
                            <p>
                                Al acceder, navegar, publicar un servicio o suscribirte a un plan en
                                Chiloé Servicios, aceptas estos Términos y Condiciones en su
                                totalidad. Si no estás de acuerdo, no uses la plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                2. Naturaleza del servicio
                            </h2>
                            <p>
                                Chiloé Servicios es un{' '}
                                <strong>directorio digital local creado en Castro, Chiloé</strong>,
                                para conectar a residentes de la isla con proveedores de servicios
                                locales (electricistas, gasfiteros, carpinteros, informáticos,
                                etc.).
                            </p>
                            <p className="mt-4">
                                No somos intermediarios, no participamos en los contratos, no
                                cobramos comisiones por trabajos ni garantizamos la calidad,
                                legalidad, seguridad o resultados de los servicios prestados. Toda
                                responsabilidad recae directamente entre el proveedor y el cliente.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                3. Publicación y planes Premium (Chiloé Pro)
                            </h2>
                            <ul className="list-disc space-y-3 pl-5">
                                <li>
                                    La publicación básica es <strong>gratuita</strong>.
                                </li>
                                <li>
                                    Los planes <strong>Chiloé Pro</strong> (1, 3, 6 o 12 meses) son
                                    pagos y otorgan prioridad en búsquedas, sello "Pro" y mayor
                                    visibilidad.
                                </li>
                                <li>
                                    <strong>Duración fija:</strong> No hay renovación automática.
                                </li>
                                <li>
                                    <strong>Pagos:</strong> Procesados de forma segura mediante{' '}
                                    <strong>Mercado Pago</strong> (aceptas también sus términos). El
                                    pago es exclusivamente por publicidad y posicionamiento.
                                </li>
                                <li>
                                    <strong>Cancelación y reembolsos:</strong> Puedes dejar expirar
                                    el plan. No se realizan reembolsos por períodos no utilizados
                                    una vez iniciado el servicio. Para cancelaciones anticipadas,
                                    contacta a soporte; no devolvemos montos parciales salvo
                                    obligación legal.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                4. Obligaciones de los usuarios
                            </h2>
                            <p className="mb-3">Debes:</p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Proporcionar información verdadera, exacta y actualizada.</li>
                                <li>
                                    Contar con los permisos legales necesarios para tu oficio (ej.
                                    certificación SEC si aplica).
                                </li>
                                <li>
                                    No publicar contenido ilegal, fraudulento o que vulnere derechos
                                    de terceros.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                5. Limitación de responsabilidad
                            </h2>
                            <p>
                                En la máxima medida permitida por la ley chilena, Chiloé Servicios
                                no será responsable por daños, pérdidas, reclamos o problemas
                                derivados del uso de la plataforma, transacciones o servicios entre
                                usuarios.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                6. Modificaciones y terminación
                            </h2>
                            <p>
                                Podemos modificar estos términos (te notificaremos por email o en el
                                sitio). Nos reservamos el derecho de suspender o eliminar cuentas
                                por incumplimientos graves, sin derecho a reembolso en planes pagos.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                7. Ley aplicable y contacto
                            </h2>
                            <p>
                                Estos términos se rigen por las leyes de Chile. Para consultas:{' '}
                                <span className="font-semibold text-brand dark:text-brand-light">
                                    legal@atlasservicios.com
                                </span>
                            </p>
                        </section>
                    </div>

                    <section className="dark:bg-muted mt-12 rounded-3xl border border-gray-100 bg-gray-50 p-8 dark:border-white/10">
                        <p className="text-center text-base font-medium text-gray-700 dark:text-gray-300">
                            Gracias por ser parte de esta iniciativa local.{' '}
                            <span className="font-bold">¡Nos ayudamos entre todos en Chiloé!</span>
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
}
