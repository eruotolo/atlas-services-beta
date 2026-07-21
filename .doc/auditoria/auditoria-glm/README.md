# Auditoría técnica — Hireeo (next-atlas-services)

## Identificación de la auditoría

| Campo | Valor |
|---|---|
| **IA / Proveedor** | Z.ai |
| **Modelo exacto** | `glm-5.2` (id interno `zai/glm-5.2`) |
| **Nombre normalizado** | `auditoria-glm` |
| **Fecha y hora de inicio** | 2026-07-19T15:47:05Z |
| **Fecha y hora de finalización** | 2026-07-19T16:10:00Z |
| **Commit analizado** | `bc5758662b77f0b69410ba7dab4c911cb452ae9a` (rama `main`) |
| **Submódulos** | frontend `3f73bab`, backend `ee40d26`, appmobile `fe9b462` |
| **Nivel de confianza general** | Alto |
| **Puntuación global** | **4.2 / 10** |

## Alcance

Auditoría integral de las 3 capas del monorepo `next-atlas-services`:

- `backend/` — NestJS 10 + Prisma 7.5 + PostgreSQL (24 módulos, ~7.5K líneas).
- `frontend/` — Next.js 16.1.1 + React 19.2 + NextAuth v4 (46 páginas, 35 server action files, 18 features).
- `appmobile/` — Expo SDK 54 + React Native 0.81.5 + expo-router 6 + NativeWind v4.
- Infraestructura: `docker-database/` (Postgres 16 + Adminer), Vercel (serverless) para backend y frontend, EAS para mobile.

## Partes revisadas

- Estructura completa de carpetas de las 3 capas.
- `backend/src/main.ts`, `app.module.ts`, los 24 módulos de `backend/src/modules/`, `common/`, `prisma/schema.prisma` (586 líneas), `.env.example`, `vercel.json`.
- `frontend/src/proxy.ts`, `lib/api/apiClient.ts`, estructura de `app/` y `features/`, `app/api/webhooks/stripe/route.ts`, `features/services/publish/actions/mutations.ts`, `next.config.ts`, `vercel.json`.
- `appmobile/src/shared/lib/apiClient.ts`, `features/` y `app/`, `app.json`, `eas.json`, `android/app/build.gradle`, `AndroidManifest.xml`.
- `docker-database/docker-compose.yml`.
- `package.json` de las 3 capas + workspace raíz.

## Partes NO revisadas

- Paneles cloud (Vercel, Neon/Supabase, Cloudinary, Stripe, MercadoPago, Firebase).
- Variables de entorno reales en `.env*` (solo se inspeccionaron patrones para detección de secretos).
- Logs y métricas en producción.
- Dispositivos físicos para la app mobile.
- Historial git detallado de los submódulos (más allá del commit actual).
- Dependencias transitivas completas (solo `pnpm audit` resumen).

## Herramientas disponibles

- Lectura de archivos (`Read`, `Glob`, `Grep`).
- Ejecución de comandos shell (`pnpm`, `npx tsc`, `git`).
- Sub-agentes de exploración (`explore`).
- Búsqueda web (`WebFetch`).
- No se dispuso de: accessos a DB, paneles cloud, dispositivos físicos, ni entornos staging.

## Comandos ejecutados (resumen)

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (3 capas) | ✅ Pasan limpio |
| `pnpm build` (backend) | ✅ Exit |
| `pnpm lint` (backend) | ❌ 17 errors, 40 warnings |
| `pnpm lint` (frontend) | ❌ `biome: command not found` |
| `pnpm lint` (appmobile) | ❌ 7 errors, 31 warnings |
| `pnpm audit --prod` (backend/workspace) | ⚠ 119 vulnerabilities (2 critical, 40 high) |
| `pnpm audit --prod` (frontend) | ⚠ 30 vulnerabilities (13 high, todas en `next` 16.1.1) |
| `git ls-files \| grep .env` | ✅ Solo `.env.example` (no hay secretos commiteados) |
| `grep` de patrones de secretos | ⚠ 6 matches en `backend/.env` (no commiteado, pero con valores reales en FS local) |

Detalle completo: [`comandos-ejecutados.md`](./comandos-ejecutados.md).

## Limitaciones encontradas

1. No hay staging ni producción desplegada verificable; los flujos de pago no se validaron end-to-end.
2. No se ejecutaron E2E, DAST, ni pruebas de carga.
3. La app mobile requiere `prebuild` nativo para validar builds Android/iOS reales.
4. No se accedió a la configuración real de Vercel ni a las variables de entorno remotas.
5. No se verificó la efectividad real de webhooks de pago (requieren pasarela real + DB).

## Resumen de hallazgos críticos

**18 hallazgos críticos** identificados (ver [`hallazgos.md`](./hallazgos.md) y [`seguridad.md`](./seguridad.md)):

### Backend (6 críticos)
1. **BE-SEC-001** — IDOR en addresses: cualquier usuario autenticado puede leer/crear/editar/eliminar direcciones físicas de otros usuarios (`users.controller.ts:135-169`).
2. **BE-SEC-002** — Refresh token stateless sin rotación ni revocación: si se filtra, el atacante mantiene acceso 30 días sin forma de invalidarlo (`auth.service.ts:120-149`).
3. **BE-SEC-003** — `POST /email/send` sin autenticación ni autorización: con solo filtrar la API_KEY (trivial desde la APK), se puede enviar phishing masivo desde el dominio de Hireeo (`email.controller.ts:13-16`).
4. **BE-SEC-004** — IDOR en WebSocket chat: cualquier usuario autenticado puede unirse a rooms de conversaciones ajenas y leer todos los mensajes (`chat.gateway.ts:67-77`).
5. **BE-SEC-005** — `JwtAuthGuard` NO es global: cada controller debe acordarse de aplicarlo; ya hay 6+ endpoints olvidados (users findAll/findOne, interactions POST, ratings findAll, etc.) expuestos con solo la API_KEY.
6. **BE-SEC-006** — Firmas de webhooks (Stripe y MercadoPago) logueadas en claro (`mercadopago.gateway.ts:38`, `stripe.gateway.ts:45`).

### Frontend (7 críticos)
7. **FE-SEC-001** — IDOR en `publicarServicioPublico`: cualquiera (sin sesión) puede publicar servicios en nombre de cualquier userId (`publish/actions/mutations.ts:60-66`).
8. **FE-SEC-002** — IDOR en `actualizarPerfil`: usuario autenticado puede modificar perfil (nombre, teléfono, avatar) de otro usuario (`users/actions/mutations.ts:120,144`).
9. **FE-RISK-001** — Ausencia total de `error.tsx`, `loading.tsx`, `not-found.tsx`, `global-error.tsx`: cualquier error runtime en una página rompe toda la app sin boundary.
10. **FE-PAY-001** — Webhook Stripe no envía `x-api-key` al backend: el `ApiKeyGuard` global rechaza la llamada → **las suscripciones pagadas con Stripe nunca se activan** (`api/webhooks/stripe/route.ts:37-46`).
11. **FE-SEC-003** — XSS en JSON-LD de página de servicio: el `.replace(/</g, '<')` es no-op; datos user-controlled (`nombre`, `comuna`, `description`) permiten inyectar `</script><script>...` (`service/[slug]/page.tsx:175`).
12. **FE-SEC-004** — Inyección HTML en email de contacto: todos los campos del formulario se interpolan sin escaping en el HTML del mail (`contact/actions/mutations.ts:55-69`).
13. **FE-PAY-002** — Server actions de pago MercadoPago son stubs (`console.info` + return success): los pagos premium MP nunca se activan aunque el webhook se dispare (`payments/actions/mutations.ts:5-24`).

### Mobile (5 críticos)
14. **MOB-001** — apiClient no envía el header `x-api-key`: `ApiKeyGuard` global del backend rechaza **todas** las llamadas autenticadas (`shared/lib/apiClient.ts:40-45`). La app es no funcional contra el backend actual.
15. **MOB-002** — `SOCKET_URL` hardcodeado a `localhost:4000` (ignora `EXPO_PUBLIC_API_URL`): chat 100% offline en builds de EAS (`features/messages/context/SocketContext.tsx:10-11`).
16. **MOB-003** — Push notifications rotas: `app.json` no define `extra.eas.projectId`, `getExpoPushTokenAsync` nunca se llama (`registerPushToken.ts:49-50`).
17. **MOB-004** — Android firmado con debug keystore en `release` → imposible subir a Play Store (`android/app/build.gradle:112-115`).
18. **MOB-005** — `applicationId 'com.anonymous.appmobile'` y `app_name = "appmobile"`: la app se publicaría con identidad anónima (`build.gradle:90,92`, `strings.xml:2`).

## Estado general del proyecto

**NO LISTO PARA PRODUCCIÓN.** Puntuación global **4.2/10**.

**Fortalezas**:
- Arquitectura DDD bien aplicada en las 3 capas (features/shared/lib).
- Backend con helmet, CORS allowlist, ValidationPipe estricto, throttle, ApiKeyGuard global.
- Cifrado AES-256-GCM correcto para credenciales de integraciones en DB.
- TypeScript strict en las 3 capas; **typecheck limpio** en todas.
- 0 TODOs/FIXMEs, 0 `console.log` de secretos, 0 `<img>` raw, 0 localStorage para tokens.
- Next.js con Server Components por defecto (0 páginas `'use client'`).
- React Compiler habilitado.

**Debilidades críticas**:
- **18 vulnerabilidades críticas** de seguridad y pagos (ver arriba).
- **0 tests** en backend y mobile (solo 5 specs E2E en frontend).
- **0 CI/CD** (no existe `.github/workflows/`).
- **Next.js 16.1.1 con 13 CVEs HIGH** parcheados en 16.2.6.
- App mobile **no funcional** contra backend actual (falta `x-api-key`).
- Flujos de pago **incompletos/rotos** (stubs de MP, webhook Stripe sin API key).
- Inconsistencias de contrato backend↔frontend↔mobile (DTOs, rutas, eventos socket).

## Próxima acción recomendada

**Bloquear cualquier deploy a producción** hasta resolver los 18 hallazgos críticos, en este orden:

1. **MOB-001** (x-api-key en mobile) — sin esto, la app no funciona.
2. **BE-SEC-005** (JwtAuthGuard global) — elimina la clase entera de endpoints olvidados.
3. **BE-SEC-001, FE-SEC-001, FE-SEC-002, BE-SEC-004** (IDORs) — vulnerabilidades de acceso vertical y horizontal.
4. **BE-SEC-003** (`/email/send` sin auth) — vector de phishing.
5. **FE-PAY-001, FE-PAY-002** (pagos) — integridad financiera.
6. **MOB-002, MOB-003, MOB-004, MOB-005** (release mobile) — imposibilidad de publicar.
7. **FE-SEC-003, FE-SEC-004, BE-SEC-006** (XSS/injection/logs).
8. **BE-SEC-002** (refresh token rotation).
9. **FE-RISK-001** (error boundaries).
10. Upgrade Next.js a `>=16.2.6` y `multer >=2.2.0`.

Plan detallado por ventanas temporales en [`plan-de-accion.md`](./plan-de-accion.md).

## Índice de documentos

| Documento | Descripción |
|---|---|
| [resumen-ejecutivo.md](./resumen-ejecutivo.md) | Resumen ejecutivo para stakeholders |
| [informe-completo.md](./informe-completo.md) | Informe consolidado con todas las secciones |
| [hallazgos.md](./hallazgos.md) | Lista completa de hallazgos con formato estándar |
| [errores-y-warnings.md](./errores-y-warnings.md) | Errores de lint, typecheck, build |
| [seguridad.md](./seguridad.md) | Auditoría de seguridad detallada |
| [arquitectura-actual.md](./arquitectura-actual.md) | Arquitectura AS-IS |
| [arquitectura-objetivo.md](./arquitectura-objetivo.md) | Arquitectura TO-BE incremental |
| [competencia-e-investigacion.md](./competencia-e-investigacion.md) | Investigación externa y competencia |
| [plan-de-accion.md](./plan-de-accion.md) | Plan por ventanas temporales |
| [informacion-faltante.md](./informacion-faltante.md) | Información necesaria no disponible |
| [comandos-ejecutados.md](./comandos-ejecutados.md) | Log de comandos ejecutados |
| [fuentes.md](./fuentes.md) | Fuentes consultadas |
| [comparacion-con-otras-auditorias.md](./comparacion-con-otras-auditorias.md) | Comparación con gpt-5 y claude-fable-5 |
| [backend/auditoria-backend.md](./backend/auditoria-backend.md) | Informe detallado del backend |
| [frontend/auditoria-frontend.md](./frontend/auditoria-frontend.md) | Informe detallado del frontend |
| [mobile/auditoria-mobile.md](./mobile/auditoria-mobile.md) | Informe detallado del mobile |
| [diagramas/](./diagramas) | Diagramas Mermaid |
| [evidencias/](./evidencias) | Salidas de comandos |

## Verificación de finalización

- [x] Resultados guardados en `.doc/auditorias/auditoria-glm/`.
- [x] Existe `README.md` que funciona como índice.
- [x] Existe `informe-completo.md` (consolidado, legible independiente).
- [x] Existe `metadata.json` válido.
- [x] Comandos realmente ejecutados registrados en `comandos-ejecutados.md`.
- [x] Fuentes consultadas registradas en `fuentes.md`.
- [x] Partes no analizadas indicadas explícitamente (ver "Limitaciones").
- [x] Verificado: **NO se guardaron secretos, tokens, credenciales ni datos personales en la documentación.** Los secretos encontrados en `backend/.env` fueron redactados en `evidencias/secretos.txt` con placeholders `[REDACTED-*]`.

## Nota sobre la ruta de guardado

El prompt genérico indicaba `.doc/<nombre-modelo>/` pero el usuario (Edgardo) indicó explícitamente que el guardado debía ser en **`.doc/auditorias/auditoria-glm/`** (con `s` en `auditorias` y subcarpeta `auditoria-glm`). Esta es la ruta respetada en esta auditoría. Las auditorías previas de `gpt-5` y `claude-fable-5` están en `.doc/auditoria/` (sin `s`), y **no se modificaron**.
