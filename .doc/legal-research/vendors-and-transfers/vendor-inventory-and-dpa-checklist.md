# Inventario de Proveedores / Terceros y Checklist de DPA

> **Proyecto:** Hireeo · **Fecha de corte:** 2026-07-23 · **Fase:** 1.1 (auditoría de código, solo lectura)
> **Base:** proveedores **detectados en el código** de `frontend/`, `backend/` y `appmobile/`. No se ha revisado ningún contrato, DPA ni acuerdo firmado (no están en el repo). El "rol probable" y los "datos que probablemente procesa" son **inferencias técnicas**, no hechos contractuales confirmados.
> **Regla:** ningún proveedor puede considerarse "confirmado contractualmente" con esta evidencia; todos requieren DPA/verificación (columna final). No se copian secretos: solo se referencia el **nombre** de la variable y su ubicación.

## Leyenda de rol (protección de datos)
- **Encargado/Procesador**: trata datos por cuenta de Hireeo siguiendo sus instrucciones.
- **Sub-encargado**: procesador contratado a través de otro procesador o para una función de soporte (IA, push).
- **Corresponsable**: determina fines/medios junto con Hireeo (típico de analítica publicitaria).
- **Recipiente/Fuente**: recibe o aporta datos sin ser necesariamente encargado (CDN, geocoding, proveedor de identidad OAuth).

---

## 1. Inventario de proveedores detectados

### 1.1 Pagos

| Proveedor | Servicio | Datos que probablemente procesa | Rol probable | Evidencia (archivo:línea) | Región/transferencia |
|-----------|----------|---------------------------------|--------------|---------------------------|----------------------|
| **Stripe** | Checkout hospedado (es/us) + KYC (Stripe Identity) | Datos de tarjeta (en dominio Stripe), email, importe, documento de identidad (KYC) | Encargado / controlador independiente para PCI | `frontend/src/app/api/payments/stripe-session/route.ts:24-30,45-67`; `backend/.../kyc/kyc.service.ts`; `integration-config.service.ts:14-28` | EE.UU. (transferencia internacional desde UE/LatAm) |
| **MercadoPago** | Pagos con Payment Brick (cl/ar/uy) | Token de tarjeta, `payment_method_id`, **número de documento del pagador** (RUT/DNI), importe, device fingerprint | Encargado / controlador independiente | `frontend/src/features/payments/components/PaymentBrick/PaymentBrick.tsx:33,43,68-89`; `webhooks/mercadopago/route.ts:20-22` | Región LatAm (verificar) |

### 1.2 IA

| Proveedor | Servicio | Datos que probablemente procesa | Rol probable | Evidencia | Región/transferencia |
|-----------|----------|---------------------------------|--------------|-----------|----------------------|
| **Google Gemini** (`gemini-2.5-flash`) | Matchmaking, chatbot, generación de descripciones, sugerencias | **Texto libre del usuario** (puede contener nombre, dirección, teléfono), `userId`, historial de conversación | Sub-encargado | `backend/.../ai-agents/ai-agents.service.ts:27-30,48,78`; `backend/.../chatbot/chatbot.service.ts:27-35`; `frontend/src/shared/lib/ai/geminiService.ts:4`; `frontend/src/features/services/actions/matchmaking.ts:6` | EE.UU./global (Google) |

### 1.3 Almacenamiento, email, push

| Proveedor | Servicio | Datos que probablemente procesa | Rol probable | Evidencia | Región/transferencia |
|-----------|----------|---------------------------------|--------------|-----------|----------------------|
| **Cloudinary** | Almacenamiento/CDN de imágenes (avatares, imágenes de servicio) | Imágenes subidas (posible PII en fotos), URLs | Encargado | `backend/src/modules/upload/upload.service.ts:4,23-32,50` | EE.UU./global |
| **Brevo** (Sendinblue) | Email transaccional (API v3) | Email del destinatario, contenido del mensaje | Encargado | `backend/src/modules/email/email.service.ts:13,33-39,50` | UE (Francia) / verificar |
| **Firebase Admin (FCM)** | Notificaciones push | Device tokens, `userId`, contenido de notificación | Sub-encargado (Google) | `backend/src/modules/notifications/notifications.service.ts:2-3,24-26,61`; modelo `DeviceToken` `schema.prisma:540-552` | EE.UU./global (Google) |

### 1.4 Identidad / autenticación (OAuth)

| Proveedor | Servicio | Datos que probablemente procesa | Rol probable | Evidencia | Región/transferencia |
|-----------|----------|---------------------------------|--------------|-----------|----------------------|
| **Google OAuth** | Login social | Email, nombre, `googleId`, avatar | Fuente de identidad | `frontend/src/app/api/auth/[...nextauth]/route.ts:190-191`; `backend/.../auth.service.ts:151-166` | EE.UU./global |
| **Apple OAuth** | Login social | Email (o relay), `appleId` | Fuente de identidad | `route.ts:194-195`; `auth.service.ts:198` | EE.UU./global |
| **Azure AD OAuth** | Login social (Microsoft) | Email, nombre, `microsoftId` | Fuente de identidad | `route.ts:198-200`; `auth.service.ts:241-257` | EE.UU./global |

### 1.5 Analítica / tracking

| Proveedor | Servicio | Datos que probablemente procesa | Rol probable | Evidencia | Región/transferencia |
|-----------|----------|---------------------------------|--------------|-----------|----------------------|
| **Google Analytics 4** (`G-WREYNC9F4M`) | Analítica web | Cookies `_ga`/`_gid`, IP, eventos, identificadores online | **Corresponsable/controlador** (analítica Google) | `frontend/src/app/layout.tsx:185-196` | EE.UU./global — **sin consentimiento (CRITICAL)** |
| **Google Tag Manager** (`GTM-PT2PFWF9`) | Gestor de etiquetas | Puede inyectar tags de terceros en runtime | Encargado (contenedor) | `frontend/src/app/layout.tsx:174-207` | EE.UU./global — **sin consentimiento (CRITICAL)** |

### 1.6 Mapas / geocoding / CDN

| Proveedor | Servicio | Datos que probablemente procesa | Rol probable | Evidencia | Región/transferencia |
|-----------|----------|---------------------------------|--------------|-----------|----------------------|
| **OpenStreetMap Nominatim** | Geocodificación inversa | Lat/lng precisas + IP del usuario | Recipiente | `frontend/src/features/home/components/HeroSearchBar/HeroSearchBar.tsx:96-110`; `ChatIA.tsx:263` | UE (OSMF) / verificar |
| **OpenStreetMap tiles** | Tiles de mapa (Leaflet) | IP del usuario (panel admin) | Recipiente | `frontend/src/features/users/components/admin/MapPicker/MapPicker.tsx:63-67` | Global |
| **Cloudflare CDN (cdnjs)** | Iconos de Leaflet | IP del usuario | Recipiente | `MapPicker.tsx:4-13` | Global |

### 1.7 Infraestructura / hosting

| Proveedor | Servicio | Datos que probablemente procesa | Rol probable | Evidencia | Región/transferencia |
|-----------|----------|---------------------------------|--------------|-----------|----------------------|
| **Vercel** | Hosting frontend + backend serverless | Todos los datos en tránsito, logs, geo-headers (`x-vercel-ip-country`) | Encargado / alojamiento | `backend/vercel.json`; `backend/src/main.ts:86-96`; `frontend/vercel.json`; `proxy.ts:42` | EE.UU./global (regiones a confirmar) |
| **PostgreSQL (Neon / pooled)** | Base de datos primaria | **Todos los datos personales** de la plataforma | Alojamiento de datos | `backend/prisma.config.ts:8-11`; `backend/src/prisma/prisma.service.ts:9` (`@prisma/adapter-pg`) | A confirmar (proveedor y región) |

> **Terceros verificados como NO presentes en el código:** Facebook Pixel, Hotjar, PostHog, Mixpanel, Segment, Microsoft Clarity, Sentry, Datadog, `@vercel/analytics`, `@vercel/speed-insights`, Amplitude, Mapbox, Google Maps JS API, AWS, Twilio, SendGrid, Vercel Blob (aunque `*.public.blob.vercel-storage.com` está en `remotePatterns` de `next.config.ts`, no hay código que suba a Vercel Blob — verificar).

---

## 2. Confirmados vs. sin confirmar contractualmente

> **Ninguno está confirmado contractualmente** con la evidencia de código disponible (no hay contratos/DPA en el repo). La siguiente clasificación indica el grado de **confirmación de uso técnico**:

| Estado | Proveedores |
|--------|-------------|
| **Uso técnico confirmado en código, DPA pendiente de verificar** | Stripe, MercadoPago, Google Gemini, Cloudinary, Brevo, Firebase/FCM, Google/Apple/Azure OAuth, Google Analytics 4, Google Tag Manager, OpenStreetMap (Nominatim + tiles), Cloudflare CDN, Vercel |
| **Inferido / a confirmar proveedor y región** | PostgreSQL host (¿Neon? — confirmar proveedor, región y DPA); Vercel Blob (referenciado en `remotePatterns` pero sin uso de subida detectado) |

---

## 3. Checklist de DPA / cumplimiento por proveedor (pendiente)

Para **cada** proveedor de la sección 1, se debe completar antes del lanzamiento (esp. con `es`/UE en alcance). Marcar `[ ]` → `[x]` al confirmar con contrato.

### 3.1 Documentación contractual mínima
- [ ] DPA (Data Processing Agreement) firmado con el proveedor.
- [ ] Cláusulas de encargado conformes (GDPR art. 28 / LOPDGDD; ley 19.628 CL; LPDP 18.331 UY; ley 25.326 AR).
- [ ] Identificación de sub-encargados y derecho de objeción.
- [ ] Compromiso de notificación de brechas y plazos.
- [ ] Asistencia en el ejercicio de derechos de titulares.
- [ ] Cláusulas de auditoría / evidencia de certificaciones (SOC 2 / ISO 27001).
- [ ] Devolución/eliminación de datos al término del servicio.

### 3.2 Transferencias internacionales (crítico para UE → EE.UU./global)
- [ ] Base de transferencia documentada (SCC de la Comisión Europea, o adhesión al EU-US Data Privacy Framework donde aplique).
- [ ] Evaluación de Impacto de Transferencia (TIA) por proveedor con destino fuera del EEE.
- [ ] Medidas suplementarias (cifrado, seudonimización) cuando la TIA lo requiera.
- [ ] Verificación de residencia/region de datos configurable (Vercel, base de datos, Cloudinary).

### 3.3 IA — Google Gemini (adicional)
- [ ] Confirmar por contrato que **el input NO se usa para entrenamiento** del modelo (no asumirlo).
- [ ] Ubicación de procesamiento y retención de prompts por Google.
- [ ] DPA específico para la API de Gemini / Google Cloud.
- [ ] Minimización: evitar enviar PII innecesaria en prompts (hoy se envía texto libre + `userId`, ver `code-audit/00-repository-inventory.md` §5.2).

### 3.4 Analítica — Google Analytics 4 / GTM (adicional, bloqueante UE)
- [ ] Implementar consentimiento previo (CMP) y Consent Mode v2 antes de cargar GA/GTM (hoy cargan sin consentimiento — CRITICAL).
- [ ] DPA de Google Analytics y configuración de anonimización/retención.
- [ ] Inventario de tags que GTM puede cargar en runtime.
- [ ] Señales de opt-out para EE.UU. (GPC / "Do Not Sell or Share").

### 3.5 Pagos (adicional)
- [ ] Confirmar alcance PCI-DSS (SAQ-A por checkout hospedado/tokenización — ver §5.3 del code-audit).
- [ ] DPA con Stripe y MercadoPago; roles (encargado vs. controlador independiente).
- [ ] Tratamiento del **número de documento de identidad** recogido en el brick de MercadoPago.

### 3.6 KYC — Stripe Identity (adicional)
- [ ] DPA para tratamiento de datos de identidad/biométricos (según método de verificación).
- [ ] Definir qué evidencia queda en Hireeo (hoy solo booleano `isKycVerified`) y su base legal/retención.

---

## 4. Preguntas abiertas para el negocio (BLOCKING/HIGH)

1. **[BLOCKING]** ¿Proveedor y región del PostgreSQL de producción? Determina la transferencia internacional del 100% de los datos personales.
2. **[BLOCKING]** ¿Hay DPA firmado con Google (Gemini + Analytics + Firebase), Stripe, MercadoPago, Cloudinary, Brevo, Vercel?
3. **[HIGH]** ¿Se aceptó operar GA4/GTM sin CMP, o es un descuido? (Bloqueante para lanzamiento UE.)
4. **[HIGH]** ¿Regiones de datos configuradas en Vercel y Cloudinary?
5. **[MEDIUM]** ¿Se usa Vercel Blob (está en `remotePatterns` pero sin código de subida)?
6. **[MEDIUM]** ¿Nominatim se usa bajo la política de uso de OSMF (límites de tasa, atribución) o se migrará a un geocoder con DPA?

> Revisión por abogado local pendiente. Este inventario alimenta las FASES 4 (privacidad/transferencias) y 12 (proveedores) del expediente.
