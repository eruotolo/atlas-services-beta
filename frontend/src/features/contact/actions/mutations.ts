'use server';

import { enviarEmail } from '@/shared/lib/email/email';

import type { ContactInput } from '../schemas/contactSchemas';
import { contactSchema } from '../schemas/contactSchemas';

export async function enviarFormularioContacto(data: ContactInput) {
    const validated = contactSchema.parse(data);

    try {
        const contenidoHtml = generarPlantillaContacto(validated);
        const emailDestino = process.env.CONTACT_EMAIL || 'info@atlasservicios.com';

        const resultado = await enviarEmail(
            { email: emailDestino, nombre: 'Atlas Services' },
            `Contacto: ${validated.asunto} - ${validated.nombre}`,
            contenidoHtml,
        );

        if (!resultado.success) {
            return { error: 'Error al enviar el mensaje. Por favor intenta nuevamente.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error al procesar formulario de contacto:', error);
        return { error: 'Error al enviar el mensaje. Por favor intenta nuevamente.' };
    }
}

function generarPlantillaContacto(datos: ContactInput): string {
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
                .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3B82F6; }
                .label { font-weight: bold; color: #666; margin-bottom: 5px; }
                .value { color: #333; margin-bottom: 15px; }
                .mensaje-box { background-color: white; padding: 15px; margin: 15px 0; border: 1px solid #E5E7EB; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📧 Nuevo mensaje de contacto</h1>
                </div>
                <div class="content">
                    <div class="info-box">
                        <div class="label">Nombre:</div>
                        <div class="value">${datos.nombre}</div>

                        <div class="label">Email:</div>
                        <div class="value">${datos.email}</div>

                        <div class="label">Celular:</div>
                        <div class="value">${datos.celular}</div>

                        <div class="label">Asunto:</div>
                        <div class="value">${datos.asunto}</div>
                    </div>

                    <div class="label">Mensaje:</div>
                    <div class="mensaje-box">
                        ${datos.mensaje.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div class="footer">
                    <p>Este mensaje fue enviado desde el formulario de contacto de Atlas Services</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
