---
title: Informe T7.1 — Inventario de países hardcodeados (INC-019)
date: 2026-08-29
tags:
  - hireeo
  - testing
  - incidencias
  - paises
aliases:
  - T7.1 inventario países
---

# Informe T7.1 — inventario de países hardcodeados (INC-019)

Insumo del Gate **G-COUNTRY** (plan canónico, fase F7). El coordinador ya cortó el modo completo: **17 puntos** (>15) y hay lógica de negocio real (pasarela, registry legal, providers). Este archivo **formaliza** ese inventario; no autoriza T7.4.

Mercados operativos actuales: `cl`, `ar`, `uy`, `es`, `us`. Activar un país en `/config/countries` **no** lo convierte en mercado operativo.

## Frontend (11)

1. `frontend/src/proxy.ts`: `SUPPORTED_COUNTRIES` array literal + `DEFAULT_COUNTRY = 'cl'` para cookie, headers CF/Vercel, `Accept-Language` y rewrite de ruta.
2. `frontend/src/app/page.tsx`: `SUPPORTED_COUNTRIES` + `DEFAULT_COUNTRY` para el redirect raíz `→ /{country}`.
3. `frontend/src/app/(country)/[country]/layout.tsx`: `VALID_COUNTRIES` + hreflang/SEO fijos a los 5 códigos vía `COUNTRY_SEO_CONFIG`.
4. `frontend/src/app/api/webhooks/mercadopago/route.ts`: `SUPPORTED_COUNTRIES` para aceptar o rechazar el `countryCode` del webhook.
5. `frontend/src/app/api/webhooks/stripe/route.ts`: `SUPPORTED_COUNTRIES` para aceptar o rechazar el `countryCode` del webhook.
6. `frontend/src/features/auth/schemas/authSchemas.ts`: `COUNTRY_CODES` como `z.enum` del campo `country` en registro.
7. `frontend/src/features/auth/components/RegisterPage/RegisterPage.tsx`: selector de país alimentado por `COUNTRY_CODES`; fallback a `'cl'` si el default no está en la lista.
8. `frontend/src/features/auth/lib/detectCountryHeaders.ts`: `SUPPORTED_COUNTRIES` + `DEFAULT_COUNTRY = 'cl'` para inferir país desde headers.
9. `frontend/src/features/integrations/lib/providers.ts`: `supportedCountries: ['cl', 'ar', 'uy']` en providers de integraciones (LATAM).
10. `frontend/src/features/legal/lib/registry.ts`: `REGISTRY` con documentos legales importados y keyed por `cl`/`ar`/`uy`/`es`/`us`.
11. `frontend/src/features/services/publish/schemas/publishSchemas.ts`: `COUNTRY_CODES` como `z.enum` en `country` / `countryCode` de publicación.

## Backend (6)

12. `backend/src/modules/payments/payments.service.ts`: `MERCADOPAGO_COUNTRIES` (`cl`/`ar`/`uy`) y `STRIPE_COUNTRIES` (`es`/`us`) para elegir pasarela.
13. `backend/src/modules/payments/gateways/stripe.gateway.ts`: `SUPPORTED_COUNTRIES = ['es', 'us']` — rechaza el resto.
14. `backend/src/modules/payments/gateways/mercadopago.gateway.ts`: `SUPPORTED_COUNTRIES = ['cl', 'ar', 'uy']` — rechaza el resto.
15. `backend/src/modules/auth/auth.service.ts`: `SUPPORTED_COUNTRIES` + `DEFAULT_COUNTRY = 'cl'` al resolver país en registro/login.
16. `backend/src/modules/auth/dto/register.dto.ts`: `SUPPORTED_COUNTRIES` array literal + `@IsIn` para validar `country` en registro.
17. `backend/src/modules/integrations/providers/integration-providers.ts`: `supportedCountries: ['cl', 'ar', 'uy']` en providers de integraciones.

## Mitigación aplicada (esta fase)

- **T7.2**: UI honesta en `CountryForm` / `CountriesOverview` — “Activo” no implica mercado operativo.
- **T7.3**: `crearUsuario` propaga `ApiError.message` (p. ej. país no soportado en `/auth/register`).
- **T7.4 no se implementa.** Un plan propio futuro debería extraer una fuente única de países operativos (routing, pagos, legal, auth, webhooks, integraciones) y dejar el catálogo de `/config/countries` como datos, no como interruptor de mercado.
