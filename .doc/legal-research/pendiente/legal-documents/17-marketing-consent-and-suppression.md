# 17 — Avisos de marketing, SMS/push y programa de consentimiento/supresión

**Audiencia:** interna (Legal, Producto, Marketing) — sirve de base para el aviso público de marketing cuando exista un programa real.
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos.
**Versión:** v0.1 — borrador.
**Estado:** 🟡 borrador — **no hay evidencia de un programa de marketing activo en el repositorio**. Este documento establece el marco mínimo que debe implementarse **antes** de enviar cualquier comunicación comercial, no describe algo que ya opera.

## 0. Hecho confirmado desde el repo

`vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` §1.3 identifica dos canales de comunicación con infraestructura ya en el código:

- **Brevo (Sendinblue):** email — usado para email **transaccional** (`backend/src/modules/email/email.service.ts`). No hay evidencia de campañas de marketing o listas de difusión comercial.
- **Firebase Admin (FCM):** push notifications, con modelo `DeviceToken` en `schema.prisma`. No hay evidencia de segmentación de campañas ni de un flag de opt-out de marketing distinto del opt-out de notificaciones transaccionales.

**Conclusión:** Hireeo hoy tiene infraestructura técnica que **podría** usarse para marketing, pero no hay evidencia de que exista un programa de marketing por email/SMS/push activo. Este documento no debe presentarse como la descripción de un programa que ya funciona.

## 1. Distinción legal clave — comunicaciones transaccionales vs. comerciales

| Tipo | Ejemplo | Base legal típica | ¿Requiere opt-in previo? |
|---|---|---|---|
| Transaccional | Confirmación de reserva, aviso de pago, alerta de seguridad | Necesidad de ejecutar el contrato/servicio | No — es inherente al servicio solicitado |
| Comercial/marketing | Promociones, novedades, recomendaciones no solicitadas | Consentimiento (UE/LOPDGDD) o interés legítimo con opt-out (variable por país) | **Sí, en la mayoría de las jurisdicciones de lanzamiento — ver §2** |

## 2. Marco mínimo antes de activar cualquier comunicación comercial (por jurisdicción)

| Jurisdicción | Requisito antes de enviar marketing por email/SMS/push |
|---|---|
| España / UE | Consentimiento previo, específico e informado (GDPR + LSSI art. 21 para comunicaciones comerciales electrónicas); opt-out fácil en cada envío |
| Uruguay | Ley 18.331 exige base legal para el tratamiento con fines de marketing; deber de ofrecer opt-out |
| Argentina | Ley 25.326 — régimen de "no llame"/opt-out ya citado en `country-analysis/argentina.md`; el marketing debe respetar listas de exclusión |
| Chile | Régimen general de consumo (Ley 19.496) exige no ser engañoso; sin norma específica anti-spam identificada en la investigación de este expediente — `[[DECISION REQUIRED: verificar si existe norma sectorial chilena de comunicaciones comerciales antes de activar campañas]]` |
| Estados Unidos | CAN-SPAM (email comercial: opt-out visible, dirección física real, no encabezados engañosos) y TCPA si se envían SMS/llamadas (requiere consentimiento expreso previo, con sanciones significativas por infracción) |

## 3. Programa de consentimiento y supresión — diseño mínimo (propuesta, no implementada)

1. **Registro de consentimiento**: fecha, canal, y texto exacto que el usuario aceptó — hoy no hay evidencia de que este registro exista.
2. **Lista de supresión** (suppression list): usuarios que se dieron de baja no deben volver a recibir comunicaciones comerciales por ningún canal — requiere que el opt-out de email/push/SMS esté unificado, no por canal separado.
3. **Separación técnica** entre comunicaciones transaccionales (no requieren opt-in) y comerciales (sí lo requieren) — hoy `DeviceToken` y el servicio de email no muestran esta distinción en el modelo de datos.
4. **Prueba de consentimiento retenible** por el plazo que exija cada autoridad en caso de auditoría — plazo `[[DECISION REQUIRED: no fijado, pendiente de política de retención general, ver documento 13]]`.

## 4. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| MKT-Q1 | ¿Existe o se planea un programa de marketing por email/SMS/push? | `MEDIUM` |
| MKT-Q2 | Si se activa, ¿el modelo de datos distinguirá comunicaciones transaccionales de comerciales, o se tratarán todas igual? | `HIGH` — condiciona si se necesita opt-in explícito |
| MKT-Q3 | ¿Hireeo enviará SMS en algún país? (activa TCPA en EE.UU. con requisitos más estrictos que email) | `MEDIUM` |

## 5. Revisión por abogado local pendiente

Este documento no debe convertirse en un aviso público de marketing hasta que exista un programa real que auditar. El marco de §2 debe confirmarse contra texto legal íntegro antes de activar cualquier campaña, en particular el régimen chileno marcado como pendiente.
