import {
    SendSmtpEmail,
    TransactionalEmailsApi,
    TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';

// Tipos para las plantillas de email
interface DatosEmailConfirmacionPago {
    nombre: string;
    email: string;
    monto: string;
    duracion: string;
    fechaInicio: string;
    fechaFin: string;
}

interface DatosEmailCredencialesProveedor {
    nombre: string;
    email: string;
    password: string;
}

interface DatosEmailCredencialesInvitado {
    nombre: string;
    email: string;
    password: string;
    servicioTitulo?: string;
}

// Configuración del cliente Brevo
const brevoClient = new TransactionalEmailsApi();
brevoClient.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

// Validación de configuración
function validarConfiguracion(): void {
    const errores: string[] = [];

    if (!process.env.BREVO_API_KEY) {
        errores.push('BREVO_API_KEY no está configurada');
    }
    if (!process.env.BREVO_SENDER_EMAIL) {
        errores.push('BREVO_SENDER_EMAIL no está configurada');
    }

    if (errores.length > 0) {
        throw new Error(`Configuración de Brevo inválida:\n${errores.join('\n')}`);
    }
}

// Plantillas HTML para emails
function generarPlantillaConfirmacionPago(datos: DatosEmailConfirmacionPago): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
                .header { background-color: #2563EB; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 30px; background-color: #ffffff; }
                .details { background-color: #F8FAFC; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2563EB; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748B; border-top: 1px solid #eee; }
                .button { display: inline-block; padding: 12px 25px; background-color: #2563EB; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0;">¡Gracias por elegir Chiloé Pro!</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${datos.nombre}</strong>,</p>
                    <p>Tu pago de <strong>$${datos.monto} CLP</strong> por el plan de <strong>${datos.duracion}</strong> ya fue confirmado exitosamente a través de Mercado Pago.</p>

                    <div class="details">
                        <h3 style="margin-top:0; color:#1E40AF;">Detalles de tu suscripción:</h3>
                        <ul style="list-style:none; padding:0; margin:0;">
                            <li><strong>Plan:</strong> Chiloé Pro ${datos.duracion}</li>
                            <li><strong>Monto pagado:</strong> $${datos.monto} CLP</li>
                            <li><strong>Fecha de inicio:</strong> ${datos.fechaInicio}</li>
                            <li><strong>Fecha de vencimiento:</strong> ${datos.fechaFin}</li>
                        </ul>
                    </div>

                    <p><strong>Beneficios activados:</strong> Prioridad máxima en búsquedas, sello "Pro", soporte prioritario y hasta 5x más visibilidad en Castro, Ancud, Quellón y toda la isla.</p>

                    <p>Tu perfil ya está destacado en la plataforma. Puedes entrar ahora a gestionar tu servicio:</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.AUTH_URL || 'https://www.chiloeservicios.cl'}/perfil" class="button" style="color:white !important;">Ir a mi Perfil</a>
                    </div>

                    <p style="margin-top:30px;">Desde ahí podrás:</p>
                    <ul>
                        <li>Editar tu descripción, fotos y precio base.</li>
                        <li>Ver estadísticas de vistas y contactos.</li>
                        <li>Gestionar tu plan cuando quieras.</li>
                    </ul>

                    <p style="font-size: 0.9em; color: #64748B; font-style: italic;">Recuerda: somos un directorio local, no cobramos comisiones por trabajos ni garantizamos clientes – solo te damos más visibilidad para que llegues a más vecinos que necesitan tu oficio.</p>

                    <p>Si tienes dudas, problemas o feedback, escríbenos directo a <a href="mailto:info@chiloeservicios.cl">info@chiloeservicios.cl</a> o por WhatsApp al <strong>+56 9 2954 0906</strong>. Estamos para ayudarte.</p>

                    <p>¡Éxito con tu servicio, vecino! Que te lleguen muchos clientes de la isla. 💪🔧</p>

                    <p>Un abrazo desde Castro,<br><strong>Chiloé Servicios</strong></p>
                </div>
                <div class="footer">
                    <p>© 2026 Chiloé Servicios | Castro, Chiloé, Chile</p>
                    <p>www.chiloeservicios.cl</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generarPlantillaCredencialesProveedor(datos: DatosEmailCredencialesProveedor): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
                .content { background-color: #F3F4F6; padding: 20px; }
                .credentials { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3B82F6; }
                .password { font-size: 18px; font-weight: bold; color: #3B82F6; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a Chiloé Servicios!</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${datos.nombre}</strong>,</p>
                    <p>Tu cuenta de proveedor ha sido creada exitosamente en Chiloé Servicios.</p>
                    <p>Hemos generado una contraseña temporal para tu cuenta:</p>

                    <div class="credentials">
                        <p><strong>Email:</strong> ${datos.email}</p>
                        <p><strong>Contraseña:</strong> <span class="password">${datos.password}</span></p>
                    </div>

                    <p><strong>Importante:</strong></p>
                    <ul>
                        <li>Guarda esta contraseña en un lugar seguro</li>
                        <li>Te recomendamos cambiarla después de tu primer inicio de sesión</li>
                        <li>Nunca compartas tu contraseña con nadie</li>
                    </ul>

                    <p>Ya puedes iniciar sesión en <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/login">tu cuenta</a> y gestionar tus servicios publicados.</p>

                    <p>Saludos,<br>El equipo de Chiloé Servicios</p>
                </div>
                <div class="footer">
                    <p>Este es un email automático. Por favor no respondas a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generarPlantillaCredencialesInvitado(datos: DatosEmailCredencialesInvitado): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
                .content { background-color: #F3F4F6; padding: 20px; }
                .credentials { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; }
                .password { font-size: 18px; font-weight: bold; color: #10B981; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Gracias por tu reseña!</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${datos.nombre}</strong>,</p>
                    <p>Gracias por dejar una reseña en Chiloé Servicios${datos.servicioTitulo ? ` para <strong>${datos.servicioTitulo}</strong>` : ''}.</p>
                    <p>Hemos creado automáticamente una cuenta para ti con las siguientes credenciales:</p>

                    <div class="credentials">
                        <p><strong>Email:</strong> ${datos.email}</p>
                        <p><strong>Contraseña:</strong> <span class="password">${datos.password}</span></p>
                    </div>

                    <p><strong>Con tu cuenta puedes:</strong></p>
                    <ul>
                        <li>Ver y editar tus reseñas</li>
                        <li>Publicar tus propios servicios</li>
                        <li>Guardar favoritos</li>
                        <li>Contactar con proveedores</li>
                    </ul>

                    <p>Puedes iniciar sesión en <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/login">cualquier momento</a>.</p>

                    <p>Saludos,<br>El equipo de Chiloé Servicios</p>
                </div>
                <div class="footer">
                    <p>Este es un email automático. Por favor no respondas a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Función genérica para enviar emails
export async function enviarEmail(
    destinatario: { email: string; nombre: string },
    asunto: string,
    contenidoHtml: string,
): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
        validarConfiguracion();

        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.subject = asunto;
        sendSmtpEmail.htmlContent = contenidoHtml;
        sendSmtpEmail.sender = {
            // biome-ignore lint/style/noNonNullAssertion: Variable de entorno validada previamente
            email: process.env.BREVO_SENDER_EMAIL!,
            name: process.env.BREVO_SENDER_NAME || 'Chiloé Servicios',
        };
        sendSmtpEmail.to = [{ email: destinatario.email, name: destinatario.nombre }];

        const response = await brevoClient.sendTransacEmail(sendSmtpEmail);

        // biome-ignore lint/suspicious/noConsole: Necesario para monitoreo
        console.log('✅ Email enviado exitosamente a:', destinatario.email);
        // biome-ignore lint/suspicious/noConsole: Necesario para monitoreo
        console.log('📧 Message ID:', response.body.messageId);

        return {
            success: true,
            messageId: response.body.messageId,
        };
    } catch (error: unknown) {
        console.error('❌ Error al enviar email a:', destinatario.email);
        console.error('Error:', error);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al enviar email',
        };
    }
}

// Funciones específicas para cada tipo de email
export async function enviarEmailConfirmacionPago(
    datos: DatosEmailConfirmacionPago,
): Promise<{ success: boolean; error?: string }> {
    const contenidoHtml = generarPlantillaConfirmacionPago(datos);

    return await enviarEmail(
        { email: datos.email, nombre: datos.nombre },
        '¡Confirmado! Tu suscripción Chiloé Pro ya está activa',
        contenidoHtml,
    );
}

export async function enviarEmailCredencialesProveedor(
    datos: DatosEmailCredencialesProveedor,
): Promise<{ success: boolean; error?: string }> {
    const contenidoHtml = generarPlantillaCredencialesProveedor(datos);

    return await enviarEmail(
        { email: datos.email, nombre: datos.nombre },
        'Bienvenido a Chiloé Servicios - Tus Credenciales de Acceso',
        contenidoHtml,
    );
}

export async function enviarEmailCredencialesInvitado(
    datos: DatosEmailCredencialesInvitado,
): Promise<{ success: boolean; error?: string }> {
    const contenidoHtml = generarPlantillaCredencialesInvitado(datos);

    return await enviarEmail(
        { email: datos.email, nombre: datos.nombre },
        'Gracias por tu reseña - Tus Credenciales de Acceso',
        contenidoHtml,
    );
}
