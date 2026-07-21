# Fuentes consultadas

Todas las fuentes consultadas durante la investigación externa, con fecha de consulta **2026-07-19**.

## Fuentes oficiales de seguridad

| # | Título | Organización | URL | Fecha pub. | Tema | Hallazgos relacionados | Confianza |
|---|---|---|---|---|---|---|---|
| 1 | OWASP Top 10 2021 | OWASP | https://owasp.org/Top10/ | 2021 | Marco de vulnerabilidades | BE-SEC-001 a 006, FE-SEC-001 a 008 | Muy alta |
| 2 | OWASP API Security Top 10 | OWASP | https://owasp.org/API-Security/ | 2023 | Seguridad API REST | BE-SEC-003, 005, 007-011 | Muy alta |
| 3 | OWASP Cheat Sheet: Authorization | OWASP | https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html | 2024 | Patrones de autorización | BE-SEC-001 (IDOR) | Muy alta |
| 4 | OWASP Cheat Sheet: JSON Web Token | OWASP | https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html | 2024 | Refresh token rotation | BE-SEC-002 | Muy alta |
| 5 | OWASP Cheat Sheet: Node.js Security | OWASP | https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html | 2024 | Hardening NestJS | BE-SEC-015, 016 | Muy alta |
| 6 | OWASP Mobile Top 10 | OWASP | https://owasp.org/www-project-mobile-top-10/ | 2024 | Seguridad mobile | MOB-001 a 005 | Muy alta |

## GitHub Security Advisories (vulnerabilidades confirmadas)

| # | Advisory | URL | CVE | Paquete afectado | CVSS | Hallazgo |
|---|---|---|---|---|---|---|
| 7 | Next.js null origin dev HMR CSRF | https://github.com/advisories/GHSA-jcc7-9wpm-mj36 | — | next 16.1.1 | Low | TRANSV-003 |
| 8 | Next.js middleware/proxy cache poisoning | https://github.com/advisories/GHSA-3g8h-86w9-wvmq | — | next 16.1.1 | Low | TRANSV-003 |
| 9 | Next.js RSC cache poisoning | https://github.com/advisories/GHSA-vfv6-92ff-j949 | — | next 16.1.1 | Low | TRANSV-003 |
| 10 | Next.js DoS (varias variantes) | https://github.com/nextjs/security-advisories | — | next 16.1.1 | High | TRANSV-003 |
| 11 | Multer DoS via nested field names | https://github.com/advisories/GHSA-72gw-mp4g-v24j | CVE-2026-5079 | multer 2.0.2 | 7.5 High | TRANSV-004 |
| 12 | ws memory exhaustion DoS | https://github.com/advisories/GHSA-96hv-2xvq-fx4p | CVE-2026-48779 | ws <8.21.0 | 7.5 High | TRANSV-005 |
| 13 | undici WebSocket DoS | https://github.com/advisories/GHSA-vxpw-j846-p89q | CVE-2026-12151 | undici <6.27.0 | 7.5 High | TRANSV-005 |
| 14 | undici SameSite downgrade | https://github.com/advisories/GHSA-g8m3-5g58-fq7m | — | undici <6.27.0 | Low | TRANSV-005 |
| 15 | hono (Prisma dev) | https://github.com/advisories/GHSA-88fw-hqm2-52qc | CVE-2026-54290 | hono <4.12.25 | 7.1 High | TRANSV-005 (dev) |
| 16 | esbuild arbitrary file read | https://github.com/advisories/GHSA-g7r4-m6w7-qqqr | — | esbuild <0.28.1 | Low (Windows) | TRANSV-005 (dev) |

## Documentación oficial de frameworks

| # | Recurso | URL | Uso |
|---|---|---|---|
| 17 | Next.js 16 docs | https://nextjs.org/docs | App Router, error boundaries, proxy.ts, server actions |
| 18 | Next.js upgrading guide | https://nextjs.org/docs/app/upgrading | Justificar bump 16.1.1 → 16.2.6 |
| 19 | NextAuth v4 docs | https://next-auth.js.org/getting-started/introduction | JWT strategy, callbacks, httpOnly cookies |
| 20 | NestJS Authorization | https://docs.nestjs.com/security/authorization | Guards globales, RolesGuard |
| 21 | NestJS GraphQL/Websockets | https://docs.nestjs.com/websockets/gateways | Auth en gateways |
| 22 | Prisma docs | https://www.prisma.io/docs | Schema, índices, migraciones |
| 23 | Expo SDK 54 | https://docs.expo.dev/versions/v54.0.0/ | Verificar APIs (notificaciones, secure-store, image) |
| 24 | Expo EAS Build | https://docs.expo.dev/build/introduction/ | Signing, credentials, projectId |
| 25 | React Native Reanimated | https://docs.swmansion.com/react-native-reanimated/ | GestureHandlerRootView requirement |
| 26 | NativeWind v4 | https://www.nativewind.dev/ | Configuración Tailwind v3 + RN |
| 27 | Vercel docs | https://vercel.com/docs | Serverless, env vars |

## Mejores prácticas y guías

| # | Recurso | URL | Uso |
|---|---|---|---|
| 28 | web.dev Core Web Vitals | https://web.dev/vitals/ | LCP/CLS/INP |
| 29 | web.dev CSP | https://web.dev/articles/csp | Recommendation: añadir CSP en frontend |
| 30 | WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Accesibilidad |
| 31 | Stripe webhook best practices | https://docs.stripe.com/webhooks | Idempotencia, signature verification |
| 32 | MercadoPago webhooks | https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks | HMAC x-signature |
| 33 | Nominatim Usage Policy | https://operations.osmfoundation.org/policies/nominatim-usage-policy/ | User-Agent + rate limit (FE-UX-003) |
| 34 | Cloudflare observability | https://developers.cloudflare.com/observability/ | Estrategia futura de observabilidad |

## Análisis de competencia

Hireeo opera en 5 países (cl, ar, uy, es, us) con dos verticales:
1. **Marketplace de servicios del hogar** (TaskRabbit, Thumbtack, HireAHelper, Fixly, Workana, Homie, YaEstá, Singula).
2. **Apps de mensajería transaccional para profesionales** (directos: WhatsApp Business).

Competidores analizados (información pública):

| # | Competidor | URL | País | Notas relevantes |
|---|---|---|---|---|
| 35 | TaskRabbit | https://www.taskrabbit.com | US/ES/UK | Líder en servicios del hogar; UI/UX muy pulida; pago Stripe |
| 36 | Thumbtack | https://www.thumbtack.com | US | Foco en cotizaciones (matches con ServiceRequest/Quote del schema) |
| 37 | HireAHelper | https://www.hireahelper.com | US | Específico mudanzas/fletes (uno de los verticales de Hireeo) |
| 38 | Fixly | https://fixly.pl | Polonia (referente EU) | Modelo similar; reviews + chat + escrow |
| 39 | Workana | https://www.workana.com | LATAM | Foco servicios profesionales remotos; no compite directo |
| 40 | YaEstá | https://www.yaesta.com | LATAM | Marketplace general |
| 41 | Homie (mx) | https://www.homie.mx | MX | Real estate; no compite directo pero referencia UX |

### Funcionalidades comunes observadas (no copiar sin contexto)
- **Escrow**: TaskRabbit y Fixly retienen el pago hasta confirmación del cliente. Hireeo ya tiene `escrow` module pero no está cableado en webhooks (FE-PAY-002).
- **Verificación de identidad (KYC)**: TaskRabbit exige KYC antes de publicar servicios. Hireeo tiene `kyc` module y `User.isKycVerified` pero no se valida en `createService` (BE-SEC-012).
- **Mensajería con bloqueo de contacto hasta reserva**: protección anti-spam.
- **Reviews bidireccionales**: cliente califica proveedor y viceversa.

### Diferenciadores posibles de Hireeo
- Multi-país con moneda y pasarela locales (CLP+MP, ARS+MP, UYU+MP, EUR+Stripe, USD+Stripe) — TaskRabbit no lo hace.
- Marketplace hyperlocal (región + localidad + comuna) con categorías en español + inglés.
- Modelo freemium con `BASIC`/`PREMIUM` ya en schema.

### Riesgo de copiar soluciones sin contexto
- **No** copiar el onboarding de TaskRabbit (US-only, sin soporte multi-moneda).
- **No** copiar el escrow de Fixly sin resolver primero FE-PAY-001/002 (webhooks rotos).

## Estándares y RFCs

| # | Recurso | URL | Uso |
|---|---|---|---|
| 42 | RFC 7519 (JWT) | https://datatracker.ietf.org/doc/html/rfc7519 | Refresh token claims |
| 43 | RFC 8252 (OAuth 2.0 for Native Apps) | https://datatracker.ietf.org/doc/html/rfc8252 | PKCE para mobile |
| 44 | NIST SP 800-63B (Authentication) | https://pages.nist.gov/800-63-3/sp800-63b.html | Política de contraseñas (FE-SEC-010) |

## Auditorías previas (referencia interna)

| # | Recurso | Ubicación | Uso |
|---|---|---|---|
| 45 | Auditoría gpt-5 | `.doc/auditoria/gpt-5/2026-07-18_bc57586/` | Comparación |
| 46 | Auditoría claude-fable-5 | `.doc/auditoria/claude-fable-5/` | Comparación |
| 47 | AUDITORIA.md raíz | `.doc/auditoria/AUDITORIA.md` | Comparación |
| 48 | Documentación interna | `.doc/analizar/` | Contexto del proyecto |

## Verificación de versiones

| # | Tool | URL | Versión chequeada |
|---|---|---|---|
| 49 | Node.js LTS | https://nodejs.org/en/about/previous-releases | Backend declara `engines.node: "22.x"` (OK); raíz migró a 24.17.0 (algunos submódulos en 22) |
| 50 | NestJS releases | https://github.com/nestjs/nest/releases | v10 (actual: v11 disponible; no recomendamos migrar salvo necesidad) |
| 51 | Next.js releases | https://github.com/vercel/next.js/releases | 16.1.1 → latest 16.2.x (recomendado actualizar) |
| 52 | Prisma releases | https://github.com/prisma/prisma/releases | v7.5 (actual) |
| 53 | Expo SDK | https://blog.expo.dev/ | SDK 54 (actual) |
| 54 | React Native | https://reactnative.dev/ | 0.81.5 (actual) |

## Notas sobre fuentes

- **No se utilizaron blogs genéricos** como base para decisiones técnicas críticas.
- Toda vulnerabilidad confirmada tiene su GHSA o CVE oficial.
- Toda recomendación de framework tiene su documentación oficial.
- Las fechas de publicación son las que aparecen en la fuente original.
