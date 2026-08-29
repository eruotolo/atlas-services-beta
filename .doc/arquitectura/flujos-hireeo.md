# Flujos Hireeo

Referencia textual (con citas `archivo:línea` y diagramas Mermaid) de cómo corre la web, sacada del código de `frontend/` y `backend/` (agosto 2026). Complementa a `diagrama/` (app React Flow en la raíz del monorepo), que es el mapa **visual e interactivo** por actor/capa/perspectiva — este documento es la vista detallada por flujo, con endpoints y archivos exactos.

**Cómo verlo**

1. WebStorm → Settings → Plugins → Marketplace → **Mermaid** → Install → Restart.
2. Abrí este archivo y el preview (icono de Mermaid / Markdown preview).
3. Obsidian también lo renderiza sin plugin.

Cada nodo de código apunta a archivos reales. Los endpoints son `/api/v1/...`.

---

## 0. Mapa maestro

```mermaid
flowchart TB
    Visit["hireeo.app"] --> Proxy["proxy.ts detecta país"]
    Proxy --> Public{"Country.active?"}
    Public -->|no| Soon["Coming soon"]
    Public -->|sí| Home["/{país} Home + ChatIA"]

    Home --> Buscar["Buscar"]
    Home --> Pub["Publicar"]
    Home --> Auth["/login /register"]

    Buscar --> Ficha["/{país}/service/slug"]
    Ficha --> Chat["Chat Socket.IO"]
    Ficha --> Review["Reseña PENDING"]
    Ficha --> Fav["Favorito"]

    Pub --> Anuncio["POST /services BASIC activo"]
    Anuncio --> Nivel{"¿Pro?"}
    Nivel -->|no| Vive["Visible 12 meses"]
    Nivel -->|sí| Pago["POST /subscriptions"]
    Pago --> Gate{"país"}
    Gate -->|cl ar uy| MP["MercadoPago Brick"]
    Gate -->|es us| ST["Stripe"]
    MP --> WH["Webhook → PREMIUM"]
    ST --> WH

    Auth --> Rol{"rol JWT"}
    Rol -->|Client o Professional| Perfil["/{país}/profile"]
    Rol -->|Admin| Adm["/{país}/admin"]
    Rol -->|SuperAdmin| Cfg["/config"]

    Perfil --> Leads["Leads / quotes / escrow"]
    Perfil --> Kyc["Stripe Identity"]
    Perfil --> ProModal["Client → Professional"]
```

---

## 1. Piezas y cómo se hablan

| Pieza | Puerto | Rol |
|---|---|---|
| Next.js 16 (`frontend/`) | 3334 | UI, routing, Auth.js, Server Actions |
| NestJS 10 (`backend/`) | 4000 `/api/v1` | Negocio, Prisma, pasarelas, WebSocket |
| PostgreSQL 16 | 5435 | Fuente de verdad |

```mermaid
flowchart LR
    Browser["Navegador"] --> Proxy["frontend/src/proxy.ts"]
    Proxy --> Pages["app/ páginas"]
    Pages --> Actions["features/*/actions Server Actions"]
    Browser --> NextAuth["/api/auth NextAuth"]
    NextAuth --> AuthAPI["POST /auth/login google apple microsoft"]
    Actions --> Client["lib/api/apiClient.ts"]
    Client -->|"x-api-key solo SSR"| Nest["Nest /api/v1"]
    Client -->|"Bearer backendToken"| Nest
    Nest --> PG[(Postgres)]
    Browser --> WS["Socket.IO /chat"]
    WS --> Nest
    Ext["Stripe MP Cloudinary Gemini Identity Firebase Brevo"] --> Nest
    Ext --> NextWH["/api/webhooks stripe mercadopago"]
    NextWH -->|"raw body + firma"| Nest
```

`apiClient` nunca manda `API_KEY` al browser. Las mutaciones van por Server Action + JWT del backend guardado en la sesión de Auth.js.

---

## 2. Entrada y país

Archivo: `frontend/src/proxy.ts`

Orden de detección: cookie `hireeo_country` → `cf-ipcountry` → `x-vercel-ip-country` → `Accept-Language` → default `cl`.

La cookie la escriben `HeroCountrySelector` y el `Footer`.

```mermaid
flowchart TD
    A["Request"] --> B{"¿/api _next favicon?"}
    B -->|sí| Z["Pasa"]
    B -->|no| C{"pathname = / ?"}
    C -->|sí| D["detectCountry → /cl /ar /uy /es /us"]
    C -->|no| E{"¿legacy /search /publish /admin /profile ...?"}
    E -->|sí| F["307 a /país + path  Cache-Control no-store"]
    E -->|no| G{"¿/login o /register?"}
    G -->|sesión viva| H["redirectByRole"]
    H --> H1["SuperAdmin → /config"]
    H --> H2["Admin → /país/admin"]
    H --> H3["resto → /país/profile"]
    G -->|sin sesión| Z
    G -->|no| I{"primer segmento es país?"}
    I -->|no| Z
    I -->|sí| J{"¿/admin?"}
    J -->|sin token| L["/login"]
    J -->|no Admin o país distinto| M["/país/unauthorized"]
    J -->|ok| Z
    I --> K{"¿/profile?"}
    K -->|sin token| L
    K -->|ok| N["Layout fuerza el país del usuario"]
```

Países en código: `cl` `ar` `uy` `es` `us`. Layout `app/(country)/[country]/layout.tsx` carga `GET /geo/countries/:code` y envuelve en `CountryProvider` (moneda, gateway, labels, `active`, `paymentsEnabled`).

Si `active === false`, el layout **público** muestra `CountryComingSoon`. Admin y perfil siguen vivos.

`/{país}/login|register|contact` hacen 301 a las rutas globales `/login` `/register` `/contact`.

---

## 3. Auth

Roles en DB: `Client`, `Professional`, `Admin`, `SuperAdmin`. El rol va por usuario **y país** (`UserRole.countryId`). SuperAdmin suele ir sin país.

Auth.js **no es la fuente de verdad**. Nest emite access (~15 min) + refresh (~30 d). NextAuth los guarda en la cookie de sesión.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as /login
    participant NA as Auth.js
    participant BE as Nest /auth
    participant DB as Postgres

    U->>FE: email+password o Google/Apple/Microsoft
    FE->>NA: signIn
    alt Credentials
        NA->>BE: POST /auth/login
        BE->>DB: bcrypt
    else OAuth
        NA->>BE: POST /auth/google o apple o microsoft + country cookie
        BE->>DB: upsert user + googleId/appleId/microsoftId
    end
    BE-->>NA: accessToken + refreshToken + roles + country
    NA-->>FE: cookie sesión
    FE->>FE: redirectByRole
    Note over NA,BE: JWT callback refresca con POST /auth/refresh. 401 invalida. Red/5xx no.
```

Archivos: `frontend/src/app/api/auth/[...nextauth]/route.ts`, `features/auth/lib/auth.service.ts`, `features/auth/lib/redirectByRole.ts`, `backend/src/modules/auth/`.

OAuth se instancia solo si hay credenciales en `/config/integrations`.

`Client` → `Professional` **no** ocurre al publicar. Es un modal de perfil: `POST /users/me/become-provider` (borra Client, crea Professional en el mismo país).

---

## 4. Buscar un profesional

```mermaid
flowchart TD
    Home["/{país} HeroSearchBar + árbol categorías"] --> Detect{"texto oficio"}
    Detect --> AI["POST /chatbot/ai/detect-category Gemini"]
    AI -->|fallback| KW["keywords locales"]
    Home --> Geo{"GPS o código postal"}
    Geo --> Resolve["GET /geo/resolve"]
    Resolve --> Loc["puede auto-crear GeoLocality"]
    Loc --> LS["localStorage hireeo_locality"]
    Detect --> URL["/{país}/search?q=&c=&region=&locality=&lat=&lng="]
    Geo --> URL
    URL --> List["GET /services active + endDate vigente"]
    List --> Order["featured desc, rating desc"]
    List --> Ficha["/{país}/service/slug"]
    Ficha --> Canon{"countryCode del servicio ≠ prefijo URL?"}
    Canon -->|sí| Redir["redirect al país real"]
```

Filtros backend (`ServicesService.findAll`): texto, categoría, comuna, nivel, destacado, país, región, localidad, radio Haversine sobre `geo_localities`.

`isTopPro` = promedio ≥ 4.5 y ≥ 10 reseñas.

Archivos: `app/(country)/[country]/(public)/search/page.tsx`, `features/services/components/search`, `backend/src/modules/services/services.service.ts`.

---

## 5. Ficha, chat, reseña, favorito

```mermaid
flowchart LR
    Ficha["GET /services/:slug"] --> UI["Hero galería about precio reseñas related"]
    UI --> ChatBtn["ServiceBookingCard"]
    ChatBtn --> Conv["POST /chat/conversations"]
    Conv --> Widget["widget ChatMensajes"]
    Widget --> Sock["Socket.IO namespace /chat JWT handshake"]
    UI --> Tel["ver teléfono / WhatsApp"]
    Tel --> Int["POST /interactions VIEW_PHONE CALL WHATSAPP"]
    UI --> Fav["POST o DELETE /users/me/favorites/:id"]
    UI --> Rev["POST /services/:id/ratings status PENDING"]
    Rev --> Adm["Admin PATCH /ratings/:id → ACTIVE"]
    Adm --> Avg["recalcula averageRating"]
    UI --> Reply["Dueño PATCH .../ratings/:id/reply"]
```

Sin sesión, el chat manda a `/login`.

Archivos: `features/services/components/detail/`, `features/chat/`, `backend/src/modules/chat/chat.gateway.ts`, `backend/src/modules/ratings/`.

---

## 6. Publicar un servicio

Ruta: `/{país}/publish` → `PublicarWizard`.

```mermaid
flowchart TD
    Start{"¿sesión?"} -->|no| P1["Paso 1 Datos"]
    Start -->|sí| P2
    Start -->|"?upgrade=id"| P4
    P1 --> Reg["verificarOCrearUsuario POST /auth/register password temporal"]
    Reg -->|409 email existe| Login["pedir /login"]
    Reg -->|ok| Sign["signIn credentials con password temporal"]
    Sign --> P2["Paso 2 Oficio"]
    P2 --> Up["/api/upload → Cloudinary"]
    P2 --> IA["generarDescripcionIA opcional"]
    P2 --> Create["POST /services JWT del dueño"]
    Create --> Live["active=true level=BASIC endDate +12 meses"]
    Live --> P3{"Paso 3 Nivel"}
    P3 -->|Básico o paymentsEnabled false| OKB["Paso éxito básico"]
    P3 -->|Premium| P4["Paso 4 Duración GET /prices"]
    P4 --> P5["Paso 5 CheckoutGateway"]
    P5 -->|paga| OKP["Paso 6 éxito Pro"]
    P5 -->|cancela| OKB
```

El anuncio **queda visible al crear**. No hay cola de aprobación. El admin puede ocultarlo (`PATCH /services/:id/active`) o destacarlo (`PATCH /services/:id/featured`, que también pone `level=PREMIUM`).

Archivos: `features/services/publish/`, `backend/src/modules/services/services.controller.ts`.

---

## 7. Pago Hireeo Pro

Gateway por país: `cl|ar|uy` → MercadoPago. `es|us` → Stripe. Si `Country.paymentsEnabled === false` → 403 en checkout y el wizard no ofrece Pro.

El importe **no** viaja desde el browser: el backend lo resuelve con `PremiumPrice` (país + duración 1|3|6|9|12).

```mermaid
sequenceDiagram
    participant W as Wizard paso 5
    participant SA as iniciarCheckoutSuscripcion
    participant BE as POST /subscriptions
    participant GW as MP o Stripe
    participant DB as Postgres
    participant WH as Webhook

    W->>SA: serviceId + durationMonths + countryCode
    SA->>BE: JWT
    BE->>DB: upsert Subscription pending
    BE->>GW: createCheckout
    GW-->>W: publicKey + preferenceId o clientSecret

    alt cl ar uy
        W->>W: Payment Brick tokeniza tarjeta
        W->>BE: POST /subscriptions/:id/mercadopago/payment
        BE->>GW: cobra
    else es us
        W->>GW: Stripe Elements con clientSecret
    end

    GW->>WH: POST /subscriptions/webhook/:countryCode
    Note over WH: Firma sobre raw body. completed es terminal.
    WH->>DB: paymentStatus=completed Service.level=PREMIUM featured=true
```

Los Route Handlers `frontend/src/app/api/webhooks/{stripe,mercadopago}/route.ts` **solo reenvían** el body crudo al backend. No verifican firma ni tocan DB.

Archivos: `features/payments/`, `backend/src/modules/subscriptions/`, `backend/src/modules/payments/`.

---

## 8. Leads, cotizaciones, escrow

La **web Next no crea** el pedido (`POST /service-requests` no existe en frontend). Lista, cotiza, acepta y cobra. El alta puede vivir en mobile / API.

```mermaid
flowchart TD
    SR["ServiceRequest PENDING en DB"] --> Feed["Pro GET /service-requests/available mismas categorías"]
    Feed --> Q["POST /quotes request pasa a QUOTED"]
    Q --> Cli["Cliente GET /service-requests y /quotes/request/:id"]
    Cli --> Acc["PATCH /quotes/:id/accept → ACCEPTED"]
    Acc --> Esc["POST /escrow/checkout quoteId"]
    Esc --> Split["15% plataforma / 85% pro"]
    Split --> Pay["checkout MP o Stripe según país del pro"]
    Note1["Split Connect / Marketplace: mock en log, no implementado"]
```

Perfil:

- Cliente → `/{país}/profile/quotes`
- Professional → `/{país}/profile/leads`

Archivos: `features/services/actions/{leads,quotes,escrow}.ts`, `backend/src/modules/{service-requests,quotes,escrow}/`.

---

## 9. KYC

Ruta: `/{país}/profile/verification`.

```mermaid
flowchart LR
    A["GET /kyc/status"] --> B["POST /kyc/session"]
    B --> C["Stripe Identity hosted"]
    C --> D["POST /kyc/webhook firma raw body"]
    D --> E{"kycStatus"}
    E --> NS["NOT_STARTED"]
    E --> PE["PENDING"]
    E --> PR["PROCESSING"]
    E --> RI["REQUIRES_INPUT reintentar"]
    E --> VE["VERIFIED terminal"]
    E --> CA["CANCELED"]
```

`isKycVerified` se deriva de `kycStatus` en el mismo update.

Archivos: `features/users/actions/kyc.ts`, `backend/src/modules/kyc/`.

---

## 10. Chat en vivo

```mermaid
sequenceDiagram
    participant C as Cliente
    participant FE as ServiceBookingCard
    participant REST as POST /chat/conversations
    participant WS as Socket.IO /chat
    participant P as Profesional

    C->>FE: solicitar / chatear
    FE->>REST: JWT + serviceId
    REST-->>FE: conversationId
    FE->>WS: handshake JWT join user:id
    C->>WS: send_message
    WS->>P: new_message room user:providerId
    P->>WS: mark_read
    WS->>C: messages_read + unread_update
```

REST: `GET/POST /chat/conversations`, mensajes, `unread-count`, `read`. Gateway: `backend/src/modules/chat/chat.gateway.ts`. Cliente: `features/chat/hooks/useChatSocket.ts`.

---

## 11. Admin

Dos paneles, mismo `AdminSidebar`, distinto `basePath`.

```mermaid
flowchart TD
    Login --> R{"roles"}
    R -->|SuperAdmin| Cfg["/config todos los países"]
    R -->|Admin del país| Adm["/{país}/admin"]
    R -->|otro| Unauth["unauthorized"]

    Cfg --> Extra["Países + Integrations + app-users"]
    Adm --> Scoped["Catálogo scoped al país"]
    Adm --> PayTog["PATCH /geo/countries/:code/payments"]

    subgraph Comun["Ambos paneles"]
        U["users"]
        S["services active / featured"]
        Rat["ratings PENDING → ACTIVE"]
        Cat["categories"]
        Pay["payments"]
        Pre["premium-prices"]
        Int["interactions"]
    end
```

`/config` layout: solo SuperAdmin. `/{país}/admin` layout: SuperAdmin o Admin cuyo `user.country === país`.

Archivos: `app/(config)/config/`, `app/(country)/[country]/(admin)/admin/`, `features/admin/components/AdminSidebar/AdminSidebar.tsx`.

---

## 12. Modelo de datos

```mermaid
erDiagram
    Country ||--o{ GeoRegion : tiene
    GeoRegion ||--o{ GeoLocality : tiene
    Country ||--o{ Service : ancla
    User ||--o{ UserRole : roles
    Role ||--o{ UserRole : define
    User ||--o{ Service : publica
    Service }o--o{ ServiceCategory : mapea
    Service ||--o| Subscription : premium
    Service ||--o{ Rating : reseñas
    Service ||--o{ Interaction : contactos
    User ||--o{ Favorite : guarda
    Service ||--o{ Conversation : chat
    Conversation ||--o{ Message : msgs
    User ||--o{ ServiceRequest : pide
    ServiceRequest ||--o{ Quote : recibe
    Country ||--o{ PremiumPrice : tarifas
    Country ||--o{ Integration : credenciales
    User ||--o{ Address : vive
```

Un `Service` vive en un país, opcionalmente región/localidad, con vigencia `endDate`. Premium es de **servicio**, no de usuario (`Subscription.serviceId` unique).

---

## 13. Capas de seguridad Nest

```mermaid
flowchart TD
    Req["Request /api/v1"] --> Thr["ThrottlerGuard 10/s 100/min"]
    Thr --> Key{"ApiKeyGuard"}
    Key -->|"@Public"| Pub["auth webhooks geo GET services GET categories GET prices"]
    Key -->|header x-api-key| Ok
    Ok --> Jwt{"JwtAuthGuard en la ruta?"}
    Jwt -->|no| Handler
    Jwt -->|sí| Roles{"RolesGuard?"}
    Roles -->|"@Roles Admin"| AdminOnly
    Roles -->|"SuperAdmin"| Bypass["bypass de roles"]
    Roles -->|dueño| Owner
```

Webhooks de pago y KYC son `@Public()`: la defensa es la **firma criptográfica** del raw body, no un secret header.

---

## 14. Rutas de la web

Prefijo `{c}` = `cl|ar|uy|es|us`.

**Globales:** `/` `/login` `/register` `/contact` `/config/*` `/design-system`

**Público:** `/{c}` `/{c}/search` `/{c}/service/[slug]` `/{c}/publish` `/{c}/pricing` legales y estáticas

**Cuenta (login):** `/{c}/profile` `services` `messages` `quotes` `leads` `favorites` `addresses` `verification` `settings`

**Admin país:** `/{c}/admin` + `users` `services` `ratings` `payments` `premium-prices` `categories` `interactions`

**SuperAdmin extra:** `/config/countries` `/config/integrations` `/config/app-users`

---

## 15. Archivos ancla

| Flujo | Frontend | Backend |
|---|---|---|
| País | `frontend/src/proxy.ts` | `modules/geo/` |
| Auth | `app/api/auth/[...nextauth]/route.ts` | `modules/auth/` |
| Buscar | `features/services/components/search` | `modules/services/services.service.ts` |
| Publicar | `features/services/publish/` | `modules/services/` |
| Pago Pro | `features/payments/` | `modules/subscriptions/` + `modules/payments/` |
| Chat | `features/chat/` | `modules/chat/` |
| Leads | `features/services/actions/leads.ts` | `modules/service-requests/` `modules/quotes/` `modules/escrow/` |
| KYC | `features/users/actions/kyc.ts` | `modules/kyc/` |
| Admin | `features/admin/` `app/(config)` | guards + cada módulo |
| HTTP | `lib/api/apiClient.ts` | `src/main.ts` `app.module.ts` |

Swagger local (no producción): `http://localhost:4000/api/docs`
