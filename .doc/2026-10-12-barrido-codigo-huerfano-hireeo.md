# Barrido de código y componentes huérfanos de hireeo, con control en CI

Fecha: 2026-10-12. Tarjeta CA-224 (padre CA-223). Autor: Tomás Vidal (Desarrollo). Repos: submódulos `frontend` y `backend` (commits locales en `main`, sin push, sin deploy, sin ramas ni worktrees) y padre. Insumo: el diagnóstico DDD/DRY de CA-179/T-32 ([2026-10-11-diagnostico-ddd-dry-hireeo.md](./2026-10-11-diagnostico-ddd-dry-hireeo.md)), anterior a las tarjetas de refactor CA-191 a CA-205.

## 1. Herramienta y configuración

- **knip 6.41.0**, `devDependency` exacta (sin `^`) en `frontend/package.json` y `backend/package.json`, con el script `knip` (`knip --no-progress`) en cada paquete. Se instaló desde la raíz (`pnpm --filter <paquete> add -D -E knip@6.41.0`) y se regeneraron los tres lockfiles (raíz, `frontend/pnpm-lock.yaml` y `backend/pnpm-lock.yaml`; los dos últimos validados con `pnpm install --frozen-lockfile --lockfile-only` porque cada submódulo se despliega por su cuenta).
- **`frontend/knip.jsonc`** declara las entradas por convención de Next (App Router): `src/app/**/{page,layout,template,loading,error,global-error,not-found,default,route,opengraph-image,twitter-image,icon,apple-icon}`, `robots`/`sitemap`/`manifest`, `proxy`/`middleware`/`instrumentation`, y las de prueba (`src/**/*.test.*`, `tests/guards/**`, `tests/e2e/**/*.{spec,setup}.ts`). `next.config.ts`, `playwright.config.ts`, `postcss.config.mjs` y `tests/guards/check.ts` los detectan solos los plugins de knip.
- **`backend/knip.jsonc`** declara `src/main.ts`, `api/index.js` (función serverless de Vercel que requiere `dist/main.js`), `prisma/seed/**` (se ejecutan a mano con ts-node), `scripts/*` y `src/**/*.spec.ts`. **Módulos, controladores, guards, decoradores y filtros no son entrada**: Nest no carga nada por convención, así que se alcanzan por imports desde `AppModule`; un módulo o controlador sin registrar aparecería como archivo sin uso. Las migraciones SQL no son código TypeScript y knip no las analiza.
- Tipos de hallazgo: todos los de knip por defecto (archivos, dependencias y devDependencies, binarios y dependencias sin declarar, exports, tipos exportados, exports duplicados, sin resolver).
- Los `ignore*` explícitos y justificados (con comentario en el propio `knip.jsonc`) son la única forma de conservar algo; están listados en §4.
- **CSS sin uso**: knip no analiza clases CSS. Se verificó a mano con `grep` sobre `src/` y `tests/` (§3.4).

## 2. Escaneo inicial

Comandos (desde la raíz del padre; salida completa más abajo):

```bash
pnpm --filter frontend knip   # exit 1
pnpm --filter backend knip    # exit 1
```

Resumen frontend: 3 archivos sin uso, 3 dependencias y 2 devDependencies sin uso, 70 exports y 57 tipos exportados sin uso, 1 export duplicado, 4 hallazgos más de configuración (`tests/e2e/auth.setup.ts` y los binarios `biome`/`prettier`, resueltos en la configuración). Resumen backend: 1 dependencia y 2 devDependencies sin uso, 1 dependencia sin declarar (`express`), 6 exports y 8 tipos exportados sin uso.

### 2.1 Salida inicial del frontend

```text
Unused files (3)
src/features/configuration/countries/actions/index.ts
src/features/contact/actions/index.ts
src/features/users/components/account/UserShell/UserShell.tsx
Unused dependencies (3)
@google/genai             package.json:32:10
@radix-ui/react-slot      package.json:38:10
class-variance-authority  package.json:40:10
Unused devDependencies (2)
@types/dotenv  package.json:64:10
dotenv         package.json:70:10
Unused exports (70)
getInteraccionesReport             src/features/analytics/actions/queries.ts:133:14
logoutAction                       src/features/auth/actions/index.ts:4:32
getCurrentUser                     src/features/auth/actions/index.ts:5:10
hasRole                            src/features/auth/actions/index.ts:5:26
isSuperAdmin                       src/features/auth/actions/index.ts:5:35
logoutAction             function  src/features/auth/actions/mutations.ts:59:23
getCurrentUser           function  src/features/auth/actions/queries.ts:8:23
hasRole                  function  src/features/auth/actions/queries.ts:16:23
isSuperAdmin             function  src/features/auth/actions/queries.ts:24:23
requireSession           function  src/features/auth/lib/guards.ts:13:23
getTopCategories                   src/features/categories/actions/queries.ts:141:14
getUnreadCount                     src/features/chat/actions/queries.ts:72:14
disconnectSocket         function  src/features/chat/lib/socket.ts:26:17
getCountryConfig                   src/features/geo/actions/index.ts:2:5
POSTAL_CODE_COUNTRIES              src/features/geo/lib/postalCodes.ts:7:14
FeaturedServiceCard                src/features/home/components/index.ts:2:10
legalSectionSchema                 src/features/legal/content/schema.ts:3:14
legalDocumentBaseSchema            src/features/legal/content/schema.ts:13:14
countryOverrideSchema              src/features/legal/content/schema.ts:21:14
AI_PROVIDER_LABEL                  src/features/legal/lib/aiTransparency.ts:10:14
getSuscripcionActiva               src/features/payments/actions/queries.ts:149:14
getPagoReciente                    src/features/payments/actions/queries.ts:153:14
subscribeToPremium       function  src/features/payments/premium/actions/mutations.ts:15:23
ReviewToggleForm                   src/features/services/components/detail/index.ts:2:10
ServiceReviewsSummary              src/features/services/components/detail/index.ts:9:10
EmptyResults                       src/features/services/components/search/index.ts:1:10
FiltersSidebar                     src/features/services/components/search/index.ts:2:10
ProviderRow                        src/features/services/components/search/index.ts:3:10
ResultsHeader                      src/features/services/components/search/index.ts:4:10
SearchHeader                       src/features/services/components/search/index.ts:5:10
SearchPagination                   src/features/services/components/search/index.ts:7:10
RedSocialSchema                    src/features/services/schemas/serviceSchemas.ts:6:10
getUsuarioById           function  src/features/users/actions/queries.ts:195:23
roleAssignmentSchema               src/features/users/schemas/userSchemas.ts:6:14
buildCountryLink         function  src/lib/country/countryUtils.ts:236:17
DataTablePagination                src/shared/components/DataTable/index.ts:2:10
DialogPortal                       src/shared/components/Dialog/Dialog.tsx:123:5
DialogOverlay                      src/shared/components/Dialog/Dialog.tsx:124:5
DialogClose                        src/shared/components/Dialog/Dialog.tsx:125:5
DropdownMenuRadioItem              src/shared/components/DropdownMenu/DropdownMenu.tsx:178:5
DropdownMenuLabel                  src/shared/components/DropdownMenu/DropdownMenu.tsx:179:5
DropdownMenuShortcut               src/shared/components/DropdownMenu/DropdownMenu.tsx:181:5
DropdownMenuGroup                  src/shared/components/DropdownMenu/DropdownMenu.tsx:182:5
DropdownMenuPortal                 src/shared/components/DropdownMenu/DropdownMenu.tsx:183:5
DropdownMenuSub                    src/shared/components/DropdownMenu/DropdownMenu.tsx:184:5
DropdownMenuSubContent             src/shared/components/DropdownMenu/DropdownMenu.tsx:185:5
DropdownMenuSubTrigger             src/shared/components/DropdownMenu/DropdownMenu.tsx:186:5
DropdownMenuRadioGroup             src/shared/components/DropdownMenu/DropdownMenu.tsx:187:5
HIRE_ICONS                         src/shared/components/hireeo/index.ts:16:10
ConfirmDialog                      src/shared/components/hireeo/index.ts:17:10
ConfirmProvider                    src/shared/components/hireeo/index.ts:18:10
Skeleton                           src/shared/components/hireeo/index.ts:24:10
SkeletonText                       src/shared/components/hireeo/index.ts:25:10
SkeletonCard                       src/shared/components/hireeo/index.ts:26:10
SkeletonStat                       src/shared/components/hireeo/index.ts:27:10
SkeletonStat             function  src/shared/components/hireeo/SkeletonStat/SkeletonStat.tsx:6:17
ALL_CATEGORIES_DATA                src/shared/components/icons/CategoryIcons/CategoryIcons.tsx:119:14
ArrowUp                            src/shared/components/icons/index.tsx:49:14
Image                              src/shared/components/icons/index.tsx:245:14
Megaphone                          src/shared/components/icons/index.tsx:341:14
Power                              src/shared/components/icons/index.tsx:434:14
Settings2                          src/shared/components/icons/index.tsx:469:14
XCircle                            src/shared/components/icons/index.tsx:578:14
TableFooter                        src/shared/components/ui/table/Table.tsx:104:41
TableCaption                       src/shared/components/ui/table/Table.tsx:104:86
AI_POLICY_PATH                     src/shared/lib/ai/geminiService.ts:6:10
CONSENT_VERSION                    src/shared/lib/cookieConsent.ts:2:14
notFoundMessage          function  src/shared/lib/messages.ts:11:17
BASELINE_PATH                      tests/guards/ratchet.ts:83:14
RULES                              tests/guards/rules.ts:355:14
Unused exported types (57)
ForgotPasswordData         type       src/features/auth/schemas/authSchemas.ts:32:13
CategoryChild              interface  src/features/categories/actions/queries.ts:43:18
CategoryInput              type       src/features/categories/schemas/categorySchemas.ts:15:13
CategoryUpdateInput        type       src/features/categories/schemas/categorySchemas.ts:16:13
CategoriaServicio          interface  src/features/categories/types/categoryTypes.ts:9:18
CrearCategoriaInput        interface  src/features/categories/types/categoryTypes.ts:19:18
ActualizarCategoriaInput   interface  src/features/categories/types/categoryTypes.ts:25:18
DetectInput                type       src/features/chatbot/schemas/chatbotSchemas.ts:10:13
FieldType                  type       src/features/integrations/types/integrationTypes.ts:15:13
IntegrationCategory        type       src/features/integrations/types/integrationTypes.ts:16:13
UpsertIntegrationInput     interface  src/features/integrations/types/integrationTypes.ts:76:18
LegalSection               type       src/features/legal/types/legalTypes.ts:3:15
LegalDocumentBase          type       src/features/legal/types/legalTypes.ts:3:29
CountryOverride            type       src/features/legal/types/legalTypes.ts:3:48
StripeElement              interface  src/features/payments/lib/stripeJs.ts:9:18
StripeConfirmResult        interface  src/features/payments/lib/stripeJs.ts:20:18
PremiumPriceInput          type       src/features/payments/premium/schemas/premiumPriceSchemas.ts:15:13
PremiumPriceUpdateInput    type       src/features/payments/premium/schemas/premiumPriceSchemas.ts:16:13
PaymentDataInput           type       src/features/payments/types/paymentTypes.ts:12:13
ProcessPaymentInput        type       src/features/payments/types/paymentTypes.ts:13:13
PaymentGatewayName         type       src/features/payments/types/paymentTypes.ts:19:13
ReviewCreateInput          type       src/features/reviews/schemas/reviewSchemas.ts:23:13
ReviewUpdateInput          type       src/features/reviews/schemas/reviewSchemas.ts:24:13
ReviewWithDetails          interface  src/features/reviews/types/reviewTypes.ts:8:18
ServiceDetail              type       src/features/services/components/detail/index.ts:11:15
ServiceReview              type       src/features/services/components/detail/index.ts:11:30
ActiveChip                 interface  src/features/services/components/search/FiltersSidebar/FiltersSidebar.tsx:14:18
AvailabilityFilter         type       src/features/services/components/search/index.ts:9:5
ClientFilters              type       src/features/services/components/search/index.ts:10:5
RatingFilter               type       src/features/services/components/search/index.ts:11:5
SortOption                 type       src/features/services/components/search/index.ts:12:5
VerificationFilter         type       src/features/services/components/search/index.ts:13:5
RegistroInvitadoInput      type       src/features/services/publish/schemas/publishSchemas.ts:48:13
PublicarServicioInput      type       src/features/services/publish/schemas/publishSchemas.ts:49:13
GenerarDescripcionIAInput  type       src/features/services/schemas/serviceSchemas.ts:60:13
LeadUrgency                type       src/features/services/types/leads.ts:1:13
LeadClient                 interface  src/features/services/types/leads.ts:3:18
LeadCategory               interface  src/features/services/types/leads.ts:9:18
ServiceRequestWithQuotes   interface  src/features/services/types/quotes.ts:28:18
ServicioFilters            interface  src/features/services/types/serviceTypes.ts:15:18
ServicioPayload            interface  src/features/services/types/shared.ts:42:18
KycTone                    type       src/features/users/lib/kycStatus.ts:12:13
ProfileUpdateInput         type       src/features/users/types/userTypes.ts:12:13
Role                       interface  src/features/users/types/userTypes.ts:16:18
UserRole                   interface  src/features/users/types/userTypes.ts:21:18
Usuario                    interface  src/features/users/types/userTypes.ts:27:18
UserWithRoles              type       src/features/users/types/userTypes.ts:38:13
BackendReviewDto           interface  src/lib/api/backendTypes.ts:97:18
BackendPrecioDto           interface  src/lib/api/backendTypes.ts:117:18
CountryFormat              interface  src/lib/country/format.ts:4:18
DeepPartial                type       src/lib/i18n/types.ts:1250:13
SearchableSelectOption     type       src/shared/components/hireeo/index.ts:12:33
HireIconName               type       src/shared/components/hireeo/index.ts:16:44
SearchableSelectOption     interface  src/shared/components/hireeo/SearchableSelect/SearchableSelect.tsx:15:18
TextSegment                type       …c/shared/components/hireeo/ui/AnimatedRotatingText/AnimatedRotatingText.tsx:10:13
MessageKey                 type       src/shared/lib/messages.ts:9:13
Review                     interface  src/shared/types/common.ts:58:18
Duplicate exports (1)
getUsers|getAdminUsers  src/features/users/actions/queries.ts
exit=1
```

### 2.2 Salida inicial del backend

```text
Unused dependencies (1)
pg  package.json:58:10
Unused devDependencies (1)
@types/pg  package.json:83:10
Unused exports (6)
COUNTRY_CODE_PATTERN     src/common/decorators/is-country-code.decorator.ts:4:14
PASSWORD_MIN_LENGTH      src/common/decorators/is-strong-password.decorator.ts:4:14
PASSWORD_MAX_LENGTH      src/common/decorators/is-strong-password.decorator.ts:5:14
STRONG_PASSWORD_PATTERN  src/common/decorators/is-strong-password.decorator.ts:6:14
QUOTE_REFERENCE_PREFIX   src/modules/escrow/escrow.service.ts:11:14
ENV_FALLBACK_MAP         src/modules/integrations/env-fallback.ts:5:14
Unused exported types (8)
SocialIdentity           type       src/modules/auth/social-auth.service.ts:49:13
FakeCountry              interface  src/modules/integrations/__fixtures__/fake-prisma.ts:21:18
FakeIntegration          interface  src/modules/integrations/__fixtures__/fake-prisma.ts:35:18
FakeAuditEntry           interface  src/modules/integrations/__fixtures__/fake-prisma.ts:45:18
IntegrationConfigSource  type       src/modules/integrations/integrations.service.ts:12:13
FieldType                type       src/modules/integrations/providers/integration-providers.ts:3:13
IntegrationCategory      type       src/modules/integrations/providers/integration-providers.ts:4:13
IntegrationField         interface  src/modules/integrations/providers/integration-providers.ts:13:18
exit=1
```

## 3. Lo borrado

Cada borrado lo confirman dos cosas: knip (o `tsc --noUnusedLocals` para lo local) y `type-check`, tests, lint y build en verde (§5). Se aplicó `knip --fix` solo para quitar el `export` o la re-exportación de barrel, y se borraron a mano o con un script sobre el AST de TypeScript las declaraciones que quedaron sin ningún uso. Ningún cambio toca rutas, páginas, layouts, route handlers, `proxy.ts`, módulos de Nest, migraciones ni seeds.

### 3.1 Frontend: archivos y componentes

| Archivo                                                       | Por qué se borra                                                                                                                                                                                                                                          |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/users/components/account/UserShell/UserShell.tsx`   | Huérfano de T-32 (DV-F08): ningún importador; `UserSidebar` se usa por otras vías.                                                                                                                                                                        |
| `features/configuration/countries/actions/index.ts`           | Huérfano de T-32: barrel sin importadores (los consumidores importan `queries` y `mutations`).                                                                                                                                                            |
| `features/contact/actions/index.ts`                           | Huérfano de T-32: barrel sin importadores.                                                                                                                                                                                                                |
| `features/users/components/account/PageHeader/PageHeader.tsx` | Alias que solo re-exportaba el de `shared`. Los 4 importadores (`profile/settings`, `profile/messages`, `profile/messages/[conversationId]`, `profile/favorites`) ahora importan `@/shared/components/hireeo/PageHeader/PageHeader`: el mismo componente. |
| `features/auth/actions/queries.ts`                            | `getCurrentUser`, `hasRole` e `isSuperAdmin` sin ningún uso; el archivo quedó sin importadores al quitar los re-exports del barrel. La sesión y los roles se verifican con `getSession` (`features/auth/lib/guards.ts`), que no se toca.                  |
| `shared/components/hireeo/SkeletonStat/SkeletonStat.tsx`      | Componente sin ningún uso; solo lo alcanzaba su re-export en el barrel `hireeo/index.ts`.                                                                                                                                                                 |

### 3.2 Frontend: declaraciones y exports

Declaraciones sin ningún uso, borradas: `getInteraccionesReport`, `getTopCategories`, `getUnreadCount`, `getUsuarioById`, `disconnectSocket`, `buildCountryLink`, `notFoundMessage`, `logoutAction`, `requireSession`, `ALL_CATEGORIES_DATA` y los tipos `ForgotPasswordData`, `CategoryInput`, `CategoryUpdateInput`, `CategoriaServicio`, `CrearCategoriaInput`, `ActualizarCategoriaInput`, `DetectInput`, `UpsertIntegrationInput`, `ReviewCreateInput`, `ReviewUpdateInput`, `ReviewWithDetails`, `RegistroInvitadoInput`, `PublicarServicioInput`, `GenerarDescripcionIAInput`, `ServiceRequestWithQuotes`, `ServicioFilters`, `ServicioPayload`, `ProfileUpdateInput`, `UserWithRoles`, `Role`, `UserRole`, `Usuario`, `BackendPrecioDto`, `DeepPartial`, `MessageKey` y `Review` (de `shared/types/common.ts`).

Re-exportaciones de barrel quitadas (los componentes y funciones siguen existiendo y se importan por su ruta directa): `FeaturedServiceCard`, `EmptyResults`, `FiltersSidebar`, `ProviderRow`, `ResultsHeader`, `SearchHeader`, `SearchPagination` y los tipos de filtros (barrel de `services/components/search`), `ReviewToggleForm`, `ServiceReviewsSummary`, `ServiceDetail`, `ServiceReview` (barrel de `services/components/detail`), `DataTablePagination`, `HIRE_ICONS`, `ConfirmDialog`, `ConfirmProvider`, `Skeleton`, `SkeletonText`, `SkeletonCard`, `SearchableSelectOption`, `HireIconName` (barrel `hireeo`), `getCountryConfig` (barrel de `geo/actions`).

Exports que solo se usan dentro de su archivo, pasados a locales (se quitó la palabra `export`): `CONSENT_VERSION`, `POSTAL_CODE_COUNTRIES`, `AI_PROVIDER_LABEL`, `legalSectionSchema`, `legalDocumentBaseSchema`, `countryOverrideSchema`, `RedSocialSchema`, `roleAssignmentSchema`, `BASELINE_PATH`, `RULES` y los tipos `CountryFormat`, `KycTone`, `TextSegment`, `SearchableSelectOption` (`SearchableSelect.tsx`), `ActiveChip`, `LeadUrgency`, `LeadClient`, `LeadCategory`, `FieldType`, `IntegrationCategory`, `CategoryChild`, `BackendReviewDto`. Además se quitó la re-exportación de tipos `LegalSection`, `LegalDocumentBase` y `CountryOverride` de `legal/types/legalTypes.ts`.

### 3.3 Frontend: variables e imports sin uso (los que marcaba el lint y `tsc --noUnusedLocals`)

- `tienePremium` en `profile/favorites`, `profile/leads`, `profile/messages`, `profile/quotes` y `profile/settings` (`page.tsx`): expresión pura sin lectores.
- Imports sin uso: `Mono` (`profile/quotes`), `searchLocalitiesByCountry` (`(public)/search/page.tsx`), `UnauthorizedError` (`auth/lib/guards.ts`), `translateFormMessage` (`PrecioPremiumForm`), `ArrowRight` (`PasoExitoBasico`), `useRef` (`MapPicker`), `useRouter` (`ChatMensajes`), `AI_POLICY_PATH` (`geminiService.ts`), `Edit2` (`hireeo/icons.ts`), `profileUpdateSchema` (`userTypes.ts`).
- Locales muertos con prefijo `_`: `_router` (`ChatMensajes`), `_selectFieldStyles` (`SearchHeader`), `_trendColor` (`Stat`).
- Advertencias de lint del frontend: de 48 (línea base de T-32) a 39.

### 3.4 Frontend: CSS `form-*` de `app/globals.css`

Verificado con `grep -rnE "form-(input|select|textarea|field-shell|phone-input|label)" src tests` y búsqueda de composiciones dinámicas (`form-${…}`, cadenas `'form-…'`): no hay ninguna.

| Clase                    | Usos fuera de `globals.css`                          | Decisión                                                                     |
| ------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `.form-input`            | 0                                                    | **Borrada**                                                                  |
| `.form-input-with-icon`  | 0                                                    | **Borrada**                                                                  |
| `.form-select-with-icon` | 0                                                    | **Borrada**                                                                  |
| `.form-select`           | `hireeo/Select`, `hireeo/SearchableSelect`           | Conservada (se fusionó su altura en su propia regla; mismo resultado visual) |
| `.form-textarea`         | `hireeo/Textarea`                                    | Conservada                                                                   |
| `.form-field-shell`      | `hireeo/Input`                                       | Conservada                                                                   |
| `.form-phone-input`      | `ui/PhoneInput`                                      | Conservada                                                                   |
| `.form-label`            | `ServicioFormBase`, `FileDropzone`, `RadioPillGroup` | Conservada                                                                   |

### 3.5 Dependencias

- **Frontend, borradas:** `@google/genai`, `@radix-ui/react-slot`, `class-variance-authority`, `dotenv`, `@types/dotenv` (sin ningún `import`, `require` ni referencia en `src/`, `tests/` ni configuraciones).
- **Backend, borradas:** `pg` y `@types/pg`. Ningún archivo los importa y `@prisma/adapter-pg` los trae como dependencia propia: comprobado con `require.resolve('pg', { paths: [dirname(require.resolve('@prisma/adapter-pg'))] })` → `pg@8.22.0`, y `type-check`, tests y build del backend en verde.

### 3.6 Backend: exports

Sin archivos sin uso. Se quitó el `export` de `COUNTRY_CODE_PATTERN`, `PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_LENGTH`, `STRONG_PASSWORD_PATTERN`, `QUOTE_REFERENCE_PREFIX`, `ENV_FALLBACK_MAP` y de los tipos `SocialIdentity`, `FakeCountry`, `FakeIntegration`, `FakeAuditEntry`, `IntegrationConfigSource`, `FieldType`, `IntegrationCategory`, `IntegrationField` (todos se usan dentro de su archivo; `tsc` con `noUnusedLocals` ya activo en el backend lo confirma).

## 4. Lo conservado y por qué

Estas cinco categorías son las únicas excepciones; cada una está en `knip.jsonc` con su comentario y como decisión en la tarjeta CA-224.

| Qué                                                                                                                                                                                                                                                  | Dónde                                                                   | Motivo                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | ---------------------------------------------------------------------------------------------------- |
| Dependencias `stripe` y `mercadopago`                                                                                                                                                                                                                | `frontend/package.json` (`ignoreDependencies`)                          | No tienen imports, pero los pagos están deshabilitados en los cinco países por decisión de producto y el dominio de pagos se conserva hasta reactivarlos.                                                                                                                                 |
| Superficie del dominio de pagos (consultas, acciones, esquemas y tipos: `getSuscripcionActiva`, `getPagoReciente`, `subscribeToPremium`, `PremiumPriceInput`, `PaymentDataInput`, `ProcessPaymentInput`, `PaymentGatewayName`, tipos de `stripeJs`…) | `src/features/payments/**` (`ignoreIssues`)                             | Mismo motivo: no se toca nada del flujo de pagos en este barrido.                                                                                                                                                                                                                         |
| `vercel` (devDependency)                                                                                                                                                                                                                             | `frontend/package.json` (`ignoreDependencies`)                          | CLI de despliegue que se invoca a mano, no desde el código.                                                                                                                                                                                                                               |
| Catálogo de iconos del barrel (`ArrowUp`, `Image`, `Megaphone`, `Power`, `Settings2`, `XCircle`)                                                                                                                                                     | `shared/components/icons/index.tsx` (`ignoreIssues`)                    | Catálogo cerrado de iconos: la regla del repo manda importar iconos solo por ese barrel; un icono no usado no es lógica.                                                                                                                                                                  |
| Kits Radix/shadcn (`DialogPortal`, `DialogOverlay`, `DialogClose`, `DropdownMenu*` no usados, `TableFooter`, `TableCaption`)                                                                                                                         | `Dialog.tsx`, `DropdownMenu.tsx`, `ui/table/Table.tsx` (`ignoreIssues`) | API completa de cada primitivo; recortarla obliga a reescribirla cuando se necesite.                                                                                                                                                                                                      |
| Alias `getAdminUsers = getUsers`                                                                                                                                                                                                                     | `features/users/actions/queries.ts` (`ignoreIssues: duplicates`)        | Nombre de intención que usan `admin/page.tsx` y `config/page.tsx`.                                                                                                                                                                                                                        |
| `dict` en `profile/services/page.tsx` y `profile` en `profile/settings/page.tsx`                                                                                                                                                                     | páginas de cuenta (siguen como advertencia de lint)                     | `getDictionary(country)` lanza `UnknownCountryError` y `getProfilePageData(...)` hace una consulta al backend: borrar la línea cambiaría el comportamiento (validación de país, consulta). `profile` quedó sin uso al quitar `tienePremium`. Queda para decidir si se retira la consulta. |
| `express` (sin declarar)                                                                                                                                                                                                                             | `backend/knip.jsonc` (`ignoreDependencies`)                             | Solo se importan tipos (`import type`) y `Response` en `ai-agents.controller.ts`; llega con `@nestjs/platform-express`.                                                                                                                                                                   |
| `@types/multer`                                                                                                                                                                                                                                      | `backend/knip.jsonc` (`ignoreDependencies`)                             | Tipos ambientales: `Express.Multer.File` se usa sin `import` en `upload.*`.                                                                                                                                                                                                               |
| Binarios `biome` y `prettier`                                                                                                                                                                                                                        | ambos `knip.jsonc` (`ignoreBinaries`)                                   | Se ejecutan desde `../node_modules/.bin` (raíz del monorepo).                                                                                                                                                                                                                             |
| Todo lo que carga Next o Nest por convención                                                                                                                                                                                                         | entradas de `knip.jsonc`                                                | `app/\*\*/page                                                                                                                                                                                                                                                                            | layout | route | …`, `proxy.ts`, `robots`/`sitemap`, `api/index.js`, `main.ts`, seeds, scripts y specs no se tocaron. |

Fuera de alcance: `appmobile/` y `diagrama/` (no pedidos), las migraciones de Prisma y el CSS fuera de `form-*`.

## 5. Control en CI

`.github/workflows/ci.yml` suma un paso `Check orphan code (knip)` en el job `backend` (después del lint) y otro en el job `frontend` (después del lint): `pnpm --filter backend knip` y `pnpm --filter frontend knip`. Falla (exit 1) ante cualquier hallazgo nuevo; el baseline es cero y las únicas excepciones son las de §4.

Demostración (salida completa en el historial de la tarjeta): se creó un archivo huérfano de prueba en cada paquete, knip falló y se borraron.

```text
$ # frontend: archivo huerfano + export sin uso de prueba
$ pnpm --filter frontend knip

> frontend@0.1.0 knip /Users/edgardoruotolo/Sites/nextjs_projects/next-atlas-services/frontend
> knip --no-progress

Unused files (2)
src/shared/lib/exportSinUso.ts
src/shared/lib/huerfanoDePrueba.ts
/Users/edgardoruotolo/Sites/nextjs_projects/next-atlas-services/frontend:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  frontend@0.1.0 knip: `knip --no-progress`
Exit status 1
exit=1
$ # backend: archivo huerfano de prueba
$ pnpm --filter backend knip

> backend@0.1.0 knip /Users/edgardoruotolo/Sites/nextjs_projects/next-atlas-services/backend
> knip --no-progress

Unused files (1)
src/common/utils/huerfano-de-prueba.ts
/Users/edgardoruotolo/Sites/nextjs_projects/next-atlas-services/backend:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  backend@0.1.0 knip: `knip --no-progress`
Exit status 1
exit=1
$ # tras borrar los huerfanos de prueba
frontend exit=0
backend exit=0
```

## 6. Verificación

Orden: type-check, test, lint, format:check, build; en `frontend` y en `backend`, sin tests saltados ni debilitados.

| Paso                | Frontend                                                            | Backend                                 |
| ------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| `pnpm type-check`   | exit 0                                                              | exit 0                                  |
| `pnpm test`         | exit 0; 141 pasan, 0 fallan, 0 saltados                             | exit 0; 832 pasan, 0 fallan, 0 saltados |
| `pnpm lint`         | exit 0; 39 advertencias, 0 errores (eran 48)                        | exit 0; 5 advertencias, 0 errores       |
| `pnpm format:check` | exit 0                                                              | exit 0                                  |
| `pnpm build`        | exit 0; misma tabla de rutas y mismos avisos que el build de `HEAD` | exit 0                                  |
| `pnpm knip`         | exit 0, sin hallazgos                                               | exit 0, sin hallazgos                   |

Nota: dos intentos de `pnpm build` del frontend fallaron con `Module not found: @vercel/turbopack-next/internal/font/google/font` (`next/font/google`, fuente Geist). No dependen de este cambio: el `build` de `HEAD` y el tercer intento con los cambios pasaron con la misma salida, y la descarga de las fuentes desde esa red responde 200. Sin los E2E de `.doc/testingqa/`: los corre Andrés Molina sobre el HEAD final (criterio 4 de la tarjeta). Los pagos siguen deshabilitados en los cinco países (las pruebas del control `arePaymentsEnabled` y de la configuración de respaldo pasan).

## 7. Escaneo final

Comandos y salida (sin hallazgos, exit 0):

```bash
pnpm --filter frontend knip   # exit 0
pnpm --filter backend knip    # exit 0
```

```text
$ pnpm --filter frontend knip
exit=0
$ pnpm --filter backend knip
exit=0
```
