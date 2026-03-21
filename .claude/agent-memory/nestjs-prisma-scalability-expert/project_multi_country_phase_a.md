---
name: multi-country-phase-a
description: Fase A del plan multi-país implementada — schema geo, módulos GEO y Payments, guards, modificaciones a módulos existentes
type: project
---

Fase A de expansión multi-país implementada (2026-03-18). Build/migrate pendiente de ejecutar por el usuario.

**Nuevos modelos en schema.prisma**: Country, GeoRegion, GeoLocality, enum PaymentGateway (MERCADOPAGO | STRIPE).

**Modelos modificados**:
- Service: agrega countryId (NOT NULL), regionId?, localityId?. Índice compuesto [countryId, level, featured, endDate].
- UserRole: unique cambia de [userId, roleId] a [userId, roleId, countryId]. Agrega countryId?.
- ServiceCategory: unique cambia de slug único a [slug, countryCode]. Agrega countryCode?.
- Subscription: agrega currency (default 'CLP') y paymentGateway (default MERCADOPAGO).
- PremiumPrice: unique cambia de durationMonths único a [countryId, durationMonths]. Agrega countryId (NOT NULL) y currency.
- Sponsor: agrega countryId?.

**Módulo GEO** (`src/modules/geo/`):
- Seeds idempotentes para CL, AR, UY, ES, US en `seeds/`
- GeoService: findAllCountries, findCountryByCode, findRegionsByCountry(countryCode), findLocalitiesByRegion(regionId)
- GeoController: GET /geo/countries, /geo/countries/:code, /geo/countries/:code/regions, /geo/regions/:regionId/localities

**Módulo Payments** (`src/modules/payments/`):
- PaymentGatewayInterface: createPayment, verifyWebhook
- MercadoPagoGateway: selecciona token por MP_ACCESS_TOKEN_{CL|AR|UY}
- StripeGateway: cliente lazy cacheado por país, STRIPE_SECRET_KEY_{ES|US}
- PaymentsService: resolveGateway(countryCode), resolveGatewayName(countryCode)
- Países MercadoPago: cl, ar, uy. Países Stripe: es, us.

**Guard** `CountryAdminGuard` en `common/guards/country-admin.guard.ts`:
- Lee countryCode del param de ruta (:countryCode o :code)
- super-admin tiene acceso universal
- admin de país verifica user.countryRoles[]

**Dependencias cruzadas nuevas**:
- SubscriptionsModule importa PaymentsService, MercadoPagoGateway, StripeGateway como providers directos

**Script seed**: `pnpm --filter backend db:seed:geo` usa ts-node (no tsx).

**Migración crítica**: countryId en Service es NOT NULL. El SQL de migración debe insertar Chile y hacer UPDATE antes del ALTER COLUMN SET NOT NULL.

**Why:** Plan multi-país para expandir Atlas Services de Chiloé a Chile completo y después Argentina, Uruguay, España y EE.UU.

**How to apply:** Al crear servicios o subscriptions, siempre requerir countryCode. Al agregar un nuevo país, agregarlo al seed correspondiente y registrar su gateway en PaymentsService (MERCADOPAGO_COUNTRIES o STRIPE_COUNTRIES).
