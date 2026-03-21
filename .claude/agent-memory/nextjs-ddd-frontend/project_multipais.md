---
name: Plan multi-país Fase B y C
description: Implementación de routing multi-país, feature/geo, PaymentRouter y webhooks multi-gateway
type: project
---

Se implementó la Fase B del plan multi-país. Los archivos creados/modificados son:

**Routing (proxy.ts)**: Reescrito con detección de país (cookie, CF-IPCountry, Vercel header, accept-language) y redirección de legacy paths `/cl/*`.

**Feature geo**: `src/features/geo/types/geoTypes.ts`, `src/features/geo/lib/countryUtils.ts`, `src/features/geo/actions/queries.ts`, `src/features/geo/components/LocalitySelect.tsx`, `src/features/geo/components/CountrySwitcher.tsx`.

**CountryProvider**: `src/lib/providers/CountryProvider.tsx` — React Context con `useCountry()` hook.

**Rutas [country]**: `src/app/(country)/[country]/layout.tsx` — llama `getCountryConfig` y envuelve en `CountryProvider`. Si el backend no devuelve config, retorna 404. Las páginas en `(country)/[country]/` re-exportan los componentes del directorio `(public)/` original.

**CRÍTICO — Stripe**: El paquete `stripe` NO está instalado. Se crearon `PaymentBrickStripe.tsx` y `PaymentBrickMP.tsx` pero el webhook `/api/webhooks/stripe/route.ts` no compilará sin `stripe` instalado. El usuario debe ejecutar: `pnpm --filter frontend add stripe`

**Legado**: `shared/types/common.ts` — `Service.comuna` ahora es `string` (no `Comuna`), se agregaron campos opcionales `countryCode`, `regionCode`, `localitySlug`. El enum `Comuna` sigue presente para retrocompatibilidad con `SearchPageClient`.

**Why:** Expansión de la plataforma desde MVP hiperlocal Chiloé a plataforma multi-país (CL, AR, UY, ES, US).

**How to apply:** El `CountryProvider` solo existe en rutas `/[country]/*`. Las rutas legacy `(public)/` siguen funcionando. Stripe requiere instalación manual.
