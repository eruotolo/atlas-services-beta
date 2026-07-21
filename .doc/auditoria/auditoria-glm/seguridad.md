# Seguridad

Auditoría de seguridad basada en OWASP Top 10 (2021) y buenas prácticas actuales. Todas las vulnerabilidades listadas están **confirmadas** salvo indicación contraria.

## Resumen de severidades

| Severidad | Cantidad | Descripción |
|---|---|---|
| 🔴 Crítica | 8 | Requieren acción inmediata; riesgo de exposición de datos, fraude o phishing |
| 🟠 Alta | 13 | Riesgo serio si se explota, mitigable con cambios puntuales |
| 🟡 Media | 4 | Endurecimiento, defence in depth |
| 🟢 Info | 2 | Buenas prácticas confirmadas |

---

## 🔴 Vulnerabilidades críticas

### SEG-CRIT-01 — Broken Access Control (IDOR) generalizado
- **OWASP**: A01:2021-Broken Access Control
- **Hallazgos**: BE-SEC-001 (addresses), BE-SEC-004 (chat WebSocket), BE-SEC-005 (JwtAuthGuard no global), FE-SEC-001 (publicar servicio), FE-SEC-002 (editar perfil)
- **Resumen**: Múltiples endpoints y server actions aceptan `userId`/`conversationId` del cliente sin validar ownership.
- **CVSS aproximado**: 8.1 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:L) — High
- **Impacto**: Lectura/escritura cross-user de direcciones físicas, perfiles, servicios y chats privados.

### SEG-CRIT-02 — Ausencia de autorización en endpoints sensibles
- **OWASP**: A01:2021
- **Hallazgos**: BE-SEC-003 (`/email/send`), BE-SEC-007 (`/users` findAll/findOne), BE-SEC-008 (`/interactions` POST)
- **Resumen**: Solo `ApiKeyGuard` global protege; la API_KEY vivirá en el bundle mobile → equivalente a "sin auth".
- **CVSS aprox**: 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N) — High

### SEG-CRIT-03 — Refresh token sin revocación (sesión persistente tras fuga)
- **OWASP**: A07:2021-Identification and Authentication Failures
- **Hallazgo**: BE-SEC-002
- **Resumen**: Refresh token stateless sin rotación ni denylist; tras fuga, acceso persistente 30 días.
- **CVSS aprox**: 7.5 — High

### SEG-CRIT-04 — Server-side request forgery / Phishing vector (`/email/send` abierto)
- **OWASP**: A01:2021 + A08:2021-Software and Data Integrity Failures
- **Hallazgo**: BE-SEC-003
- **Impacto**: Posibilidad de phishing masivo desde dominio confiable.

### SEG-CRIT-05 — XSS almacenado (JSON-LD) + HTML injection en email
- **OWASP**: A03:2021-Injection
- **Hallazgos**: FE-SEC-003 (XSS JSON-LD), FE-SEC-004 (HTML injection email)
- **CVSS aprox**: 7.4 (XSS stored) — High

### SEG-CRIT-06 — Webhook signature exposure (logs)
- **OWASP**: A09:2021-Security Logging and Monitoring Failures
- **Hallazgo**: BE-SEC-006
- **Impacto**: Filtración de firmas de webhook en logs.

### SEG-CRIT-07 — Mobile API contract roto (app no funcional)
- **Hallazgo**: MOB-001 (sin `x-api-key`)
- **Impacto**: Todas las llamadas mobile reciben 401; combinado con BE-SEC-005, el problema se amplifica.

### SEG-CRIT-08 — Datos sensibles expuestos en `session.user`
- **OWASP**: A02:2021-Cryptographic Failures
- **Hallazgo**: FE-SEC-008
- **Impacto**: Access+refresh token del backend accesibles a cualquier Client Component vía `useSession()`.

---

## 🟠 Vulnerabilidades altas

| ID | OWASP | Descripción |
|---|---|---|
| SEG-H-01 | A01:2021 | `POST /notifications/send` acepta `userId` del body (BE-SEC-009) |
| SEG-H-02 | A01:2021 | `POST /ai-agents/chat` permite crear solicitudes a nombre de otro (BE-SEC-010) |
| SEG-H-03 | A01:2021 | `findOne` en service-requests/quotes sin ownership (BE-SEC-011) |
| SEG-H-04 | A01:2021 | `createService` no exige rol Professional (BE-SEC-012) |
| SEG-H-05 | A04:2021-Insecure Design | `findBySlug` público expone email+teléfono (BE-SEC-013) |
| SEG-H-06 | A07:2021 | Microsoft login no valida `aud` (BE-SEC-014) |
| SEG-H-07 | A05:2021-Security Misconfiguration | Multer sin `limits` + MIME spoofable (BE-SEC-015, BE-SEC-016) |
| SEG-H-08 | A04:2021 | Webhooks sin idempotencia (BE-PAY-001) |
| SEG-H-09 | A05:2021 | CORS wildcard en WebSocket (BE-PAY-002) |
| SEG-H-10 | A08:2021 | Webhook MP sin verificación de firma (FE-SEC-005) |
| SEG-H-11 | A01:2021 | `/api/revalidate` sin auth (FE-SEC-006) |
| SEG-H-12 | A04:2021 | Stripe session sin auth ni precio server-side (FE-SEC-007) |
| SEG-H-13 | A07:2021 | `Math.random` para contraseña de invitado (FE-SEC-009) |

---

## 🟡 Vulnerabilidades medias

| ID | Descripción |
|---|---|
| SEG-M-01 | `/auth/refresh` sin throttle específico (BE-SEC-017) |
| SEG-M-02 | RolesGuard no valida país (multi-tenancy débil) (BE-SEC-018) |
| SEG-M-03 | Fallback a ENV vars en `IntegrationConfigService` (BE-INFO-002) |
| SEG-M-04 | Mobile: `uploadImage` sin auth ni API key (MOB-SEC-001) |

---

## 🛡️ Controles ausentes

1. **Sin WAF**: No hay mención a WAF en Vercel (no expuesto; Cloudflare podría añadirse).
2. **Sin CSP**: No se detecta `Content-Security-Policy` configurada en Next.js.
3. **Sin rate limiting por IP en endpoints críticos**: ThrottlerGuard global es insuficiente; login/refresh/reset necesitan buckets propios.
4. **Sin detección de fuerza bruta**: No hay bloqueo tras N intentos fallidos.
5. **Sin MFA**: No hay segundo factor para admins ni profesionales (manejan pagos).
6. **Sin auditoría de seguridad**: Solo `IntegrationAuditLog` existe; no hay log de logins, cambios de rol, accesos admin.
7. **Sin gestión de sesiones**: No hay lista de sesiones activas por usuario, ni "cerrar otras sesiones".
8. **Sin headers de seguridad adicionales**: helmet por defecto (bueno), pero no se configuran CSP, HSTS preload, X-Content-Type-Options adicionales.
9. **Sin подпись pinning** mobile (esperado, pero se recomienda para banking-level flows).
10. **Sin obfuscación / anti-tamper mobile**: la APK es fácilmente reversible (API_KEY extraíble).
11. **Sin SAST/DAST automáticos**: No hay Semgrep, Snyk Code, ni GitHub Code Scanning.
12. **Sin secret scanning automatizado**: No hay GitHub push protection habilitado (no se verificó).

---

## 🔑 Secretos encontrados

| Ubicación | Estado | Riesgo |
|---|---|---|
| `backend/.env` (FS local) | ⚠ No commiteado, **pero con valores reales** en filesystem | Si el equipo se comparte o el FS se backup-ea sin cuidado, exposición |
| `backend/.env.production` (FS local) | ⚠ No commiteado, 47 líneas | Igual que arriba |
| `appmobile/.env.production` (FS local) | ⚠ No commiteado, contiene `EXPO_PUBLIC_API_KEY` real | Va al bundle de la app |
| `git ls-files \| grep .env` | ✅ Solo `.env.example` | Correcto |

**Secretos confirmados en `backend/.env`**:
- `GEMINI_API_KEY` (AIzaSy...)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` (placeholders dev débiles)
- `WEBHOOK_SECRET`
- `API_KEY` (header `x-api-key`)
- `CLOUDINARY_API_SECRET`

**Acción**: Rotar todos estos secretos antes de cualquier deploy (aunque no estén commiteados, están en FS local y el equipo pudo tener acceso).

---

## Plan de remediación de seguridad

### Fase 1 — 0-72h (críticos)
1. **BE-SEC-005**: Hacer `JwtAuthGuard` global.
2. **BE-SEC-001, BE-SEC-004, FE-SEC-001, FE-SEC-002**: Fix IDORs con `@CurrentUser()`.
3. **BE-SEC-003**: Proteger `/email/send` con `ServiceTokenGuard` o eliminar.
4. **BE-SEC-006**: Quitar logs de firmas.
5. **FE-SEC-003, FE-SEC-004**: Fix XSS/injection.
6. **MOB-001**: Añadir `x-api-key` en mobile.

### Fase 2 — 7 días (altos)
7. **BE-SEC-002**: Refresh token rotation + revocación.
8. **FE-SEC-008**: Mover tokens a cookies httpOnly separadas.
9. **BE-SEC-007 a BE-SEC-016**: Resto de autorización.
10. **FE-SEC-005 a FE-SEC-007**: Webhooks MP, revalidate, stripe session.
11. **TRANSV-003, TRANSV-004**: Update Next.js y multer.

### Fase 3 — 30 días (endurecimiento)
12. SAST + secret scanning en CI.
13. Rate limiting por endpoint crítico.
14. Auditoría de logins y acciones admin.
15. Headers CSP en Next.js.
16. `@ts-nocheck` removido en ai-agents.

### Fase 4 — 90 días
17. MFA para admins.
18. Obfuscación mobile + App Check / Play Integrity.
19. Bug bounty privado o pentest externo.
20. Política de retención de datos (GDPR).

---

## Fuentes de referencia

Ver [`fuentes.md`](./fuentes.md). Principales:
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [GitHub Security Advisories](https://github.com/advisories)
- [NIST CVSS Calculator](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator)
