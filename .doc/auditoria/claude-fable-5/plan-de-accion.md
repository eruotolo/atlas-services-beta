# Plan de acción

Cada acción indica objetivo, dependencias, riesgo, esfuerzo, impacto, resultado esperado y criterio de aceptación. Responsable sugerido entre paréntesis (equipo pequeño: Full-stack = FS, Backend = BE, Frontend = FE, Mobile = MO, DevOps = OPS).

## Primeras 24–72 horas (crítico e inmediato)

### A1. Actualizar Next.js a 16.2.6 (FE)
- **Objetivo:** cerrar 13 CVEs (incl. cache poisoning RSC). **Dep:** ninguna. **Riesgo:** bajo (patch). **Esfuerzo:** muy bajo. **Impacto:** alto.
- **Resultado:** `pnpm --filter frontend up next@16.2.6 && pnpm build`. **Aceptación:** `pnpm audit` sin advisories de `next`; build verde; smoke de login/búsqueda.

### A2. Proteger `GET /users` con rol admin (BE)
- **Objetivo:** cerrar fuga de PII (BE-05). **Dep:** ninguna. **Riesgo:** bajo (revisar quién consume el listado). **Esfuerzo:** muy bajo. **Impacto:** alto.
- **Resultado:** `@UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)`. **Aceptación:** sin JWT admin → 403; panel admin sigue funcionando.

### A3. Autenticar `/api/revalidate` (FE)
- **Objetivo:** evitar invalidación de caché arbitraria (FE-07). **Esfuerzo:** muy bajo. **Impacto:** medio-alto.
- **Resultado:** exigir `REVALIDATE_SECRET` con `safeEqual`. **Aceptación:** sin secreto → 401.

### A4. Restringir CORS del WebSocket Gateway (BE)
- **Objetivo:** cerrar `origin:'*'` (BE-03). **Esfuerzo:** muy bajo. **Impacto:** medio.
- **Resultado:** usar `FRONTEND_URL` en el gateway. **Aceptación:** origen no permitido rechazado.

## Próximos 7 días (alto impacto, bajo riesgo)

### B1. Definir y arreglar el modelo de auth de mobile (MO/BE)
- **Objetivo:** que mobile consuma endpoints protegidos (MO-06). **Dep:** decisión de arquitectura (api-key por plataforma vs excluir ApiKeyGuard con JWT válido). **Riesgo:** medio. **Esfuerzo:** bajo-medio. **Impacto:** alto (mobile hoy limitado a endpoints públicos).
- **Aceptación:** login → perfil → favoritos en mobile sin 401. **No** incrustar la api-key global en el binario.

### B2. Eliminar webhooks/checkout duplicados del frontend (FS)
- **Objetivo:** una sola capa de pago con firma en backend (FE-10). **Dep:** A-pagos (ver C1). **Esfuerzo:** bajo. **Impacto:** medio.
- **Aceptación:** rutas `app/api/webhooks/*` y `stripe-session` retiradas; flujo por backend.

### B3. Limpiar archivos temporales versionados y `.env.example` (FS)
- **Objetivo:** TR-13 + TR-15. **Esfuerzo:** muy bajo. **Impacto:** bajo-medio.
- **Aceptación:** `fix_*.js`, `server.log`, `unsplash_results.json`, etc. fuera del repo; api-key pública eliminada del ejemplo.

### B4. CI mínimo en GitHub Actions (OPS)
- **Objetivo:** typecheck + lint + build por app en cada PR (TR-08 parcial). **Esfuerzo:** bajo. **Impacto:** alto.
- **Aceptación:** PR bloqueado si falla typecheck/build.

## Próximos 30 días (estabilización, seguridad, testing, observabilidad)

### C1. Implementar el flujo de pago real (BE) — **el más importante**
- **Objetivo:** cerrar TR-01 (pasarelas stub + mapeo webhook). **Dep:** credenciales sandbox MP/Stripe. **Riesgo:** medio-alto. **Esfuerzo:** alto. **Impacto:** crítico (habilita monetización).
- **Aceptación:** pago sandbox por país (cl + es) activa suscripción y sube servicio a PREMIUM, verificado en DB; e2e de pago verde.

### C2. Rotación/revocación de refresh tokens + logout server-side (BE)
- **Objetivo:** TR-09. **Esfuerzo:** medio. **Impacto:** alto. **Aceptación:** logout invalida refresh; refresh reutilizado → 401.

### C3. Observabilidad base (OPS/FS)
- **Objetivo:** Sentry (web/mobile/api) + health/readiness endpoint + logs estructurados. **Esfuerzo:** medio. **Impacto:** alto. **Aceptación:** un error de producción es rastreable con contexto y correlation id.

### C4. Tests de dominio crítico (BE)
- **Objetivo:** unitarios de auth, payments, subscriptions, permisos y ownership de chat. **Esfuerzo:** medio-alto. **Impacto:** alto. **Aceptación:** cobertura útil de los módulos de dinero/permisos; corren en CI.

### C5. Implementar o deshabilitar `forgot-password` (BE/MO)
- **Objetivo:** MO-11. **Esfuerzo:** bajo-medio. **Impacto:** medio. **Aceptación:** recuperación funcional con rate limit y sin enumeración, o UI oculta.

## Próximos 90 días (escalabilidad y estructura)

### D1. Migrar backend a runtime long-running + Redis (OPS/BE)
- **Objetivo:** BE-04/BE-16 (chat estable, throttler y socket.io con Redis). **Dep:** decisión de hosting. **Riesgo:** medio. **Esfuerzo:** alto. **Impacto:** alto. **Aceptación:** chat estable con ≥2 réplicas; rate limit consistente.

### D2. Contrato de API compartido (FS)
- **Objetivo:** generar cliente TS desde OpenAPI y consumirlo en web+mobile. **Esfuerzo:** medio. **Impacto:** alto (evita deriva de contratos). **Aceptación:** tipos de request/response generados; un cambio breaking en backend rompe el build de los clientes.

### D3. Entorno de staging + tests e2e/contrato en CI (OPS)
- **Objetivo:** promoción segura. **Esfuerzo:** medio. **Impacto:** alto.

## Largo plazo

- Migración a NestJS 11 y Auth.js v5 (al tocar auth).
- Upgrade Expo SDK 56 (cierra criticals de tooling).
- Réplica de lectura PostgreSQL + caché + colas (BullMQ) cuando las métricas lo pidan.
- Completar KYC/escrow reales si el modelo transaccional se activa.

## Matriz esfuerzo × impacto (resumen)

| Acción | Esfuerzo | Impacto | Prioridad |
|--------|----------|---------|-----------|
| A1 Next 16.2.6 | Muy bajo | Alto | 🔴 Ya |
| A2 /users admin | Muy bajo | Alto | 🔴 Ya |
| A3 revalidate secret | Muy bajo | Medio-alto | 🔴 Ya |
| A4 CORS gateway | Muy bajo | Medio | 🔴 Ya |
| C1 Pagos reales | Alto | Crítico | 🔴 30d |
| B4 CI mínimo | Bajo | Alto | 🟠 7d |
| B1 Auth mobile | Bajo-medio | Alto | 🟠 7d |
| C2 Refresh tokens | Medio | Alto | 🟠 30d |
| C3 Observabilidad | Medio | Alto | 🟠 30d |
| D1 Backend long-running | Alto | Alto | 🟡 90d |
