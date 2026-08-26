# cookies/consent-design-spec — Especificación de diseño del banner y centro de preferencias (CMP) (Fase 5)

- **Proyecto:** Hireeo — marketplace multi-país de servicios.
- **Fecha de corte:** 2026-07-23
- **Versión:** 0.1 (especificación técnica, requiere revisión legal por jurisdicción antes de publicar).
- **Insumos:** `./cookie-and-tracker-audit.md` (inventario verificado), `../country-analysis/{spain-eu,argentina,uruguay,united-states-federal,united-states-state-local-matrix}.md`, `../code-audit/00-repository-inventory.md` §5.5.
- **Alcance técnico real:** el objetivo es cerrar la brecha de `frontend/src/app/layout.tsx:170-207` (GTM `GTM-PT2PFWF9` + GA4 `G-WREYNC9F4M` cargando sin gate). No modifica código en esta fase; especifica **qué** debe construirse y **cómo se prueba**.

> **Aviso.** Documento de investigación técnico-jurídica, no asesoramiento legal. Requiere validación de abogado habilitado en cada jurisdicción. Marcadores: **[OBLIGACIÓN]**, **[BUENA PRÁCTICA]**, **[FUTURO]**, **[SUPUESTO]**.

---

## 0. Principio rector (no negociable)

**Ningún script, cookie, píxel ni identificador de categoría no esencial puede ejecutarse, cargarse ni escribirse en el terminal del usuario ANTES de un consentimiento válido**, donde ese consentimiento sea exigible (España/UE hoy; Chile desde 2026-12-01; criterio prudente en AR/UY; opt-out/GPC en EE. UU.). El estado por defecto es **rechazo** (`denied`). Aceptar y rechazar deben ser **igual de fáciles y visibles**. [OBLIGACIÓN — LSSI 22.2 + Guía AEPD 2024 + GDPR 6.1.a; Ley 21.719 CL].

Hoy esto **no se cumple**: GTM/GA4 se inyectan incondicionalmente en `layout.tsx`. La CMP especificada abajo es un **bloqueador de lanzamiento (P0)** para `/es`.

---

## 1. Categorías de consentimiento

| Categoría | Clave técnica | ¿Consentimiento? | Elementos actuales (del inventario) | Comportamiento por defecto |
|---|---|---|---|---|
| **Estrictamente necesarias** | `necessary` | No (siempre activas) | Cookie sesión NextAuth (F-2), `hireeo_country` (F-1), `sessionStorage` intro (F-3) | Activas; no desactivables; declaradas en la política |
| **Preferencias** | `preferences` | Recomendado (funcionales) | `hireeo_country`, intro-seen (podrían clasificarse aquí si se prefiere granularidad) | Off hasta aceptar (o tratarlas como necesarias si son puramente funcionales) |
| **Analítica** | `analytics` | **Sí** | **GA4 `G-WREYNC9F4M`** (T-2 + cookies `_ga`/`_ga_*`/`_gid`/`_gat`); tags de analítica dentro de GTM | **`denied` por defecto** |
| **Marketing / publicidad** | `marketing` | **Sí** | Tags de marketing dentro de **GTM `GTM-PT2PFWF9`** (Google Ads/Floodlight/Meta si existieran — [SUPUESTO C-07]); futuros píxeles | **`denied` por defecto** |

> **Geocoding (Nominatim, T-4/T-5) y CDN de mapa (T-6):** no son cookies; se tratan por **aviso de tercero + acción explícita del usuario** (permiso del navegador para geolocalizar), no por la CMP. Documentar en la política de privacidad/cookies.

---

## 2. Comportamiento técnico esperado (arquitectura)

### 2.1 Bloqueo previo real (el requisito central)

1. **Retirar GTM/GA4 del render incondicional** de `frontend/src/app/layout.tsx:170-207`. No deben emitirse los `<script>`/`<noscript>`/`preconnect` hasta que exista señal de consentimiento para su categoría. **[OBLIGACIÓN]**
2. **Consent Mode v2 de Google como primer script**, antes de GTM, fijando el estado por defecto denegado:
   ```js
   // Debe ejecutarse ANTES de cargar gtm.js / gtag.js
   window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
   gtag('consent', 'default', {
     ad_storage: 'denied',
     ad_user_data: 'denied',
     ad_personalization: 'denied',
     analytics_storage: 'denied',
     wait_for_update: 500
   });
   ```
   Al aceptar, se emite `gtag('consent','update',{ analytics_storage:'granted', ... })`. **[OBLIGACIÓN + BUENA PRÁCTICA — G-CONSENT]**
3. **Carga diferida por categoría:** GA4 solo se carga/activa si `analytics === granted`; los tags de marketing del contenedor GTM solo si `marketing === granted`. Preferir `next/script` con `strategy` controlada por el estado de consentimiento, o gating del propio contenedor GTM vía Consent Mode.
4. **Sin identificadores antes de aceptar:** verificable — no debe existir ninguna cookie `_ga*`/`_gid`/`_gat` ni petición a `google-analytics.com`/`googletagmanager.com/gtm.js` en el estado inicial.

### 2.2 Registro y persistencia del consentimiento

5. **Persistir la elección** en una cookie/almacenamiento propio de categoría necesaria (p. ej. `hireeo_consent`) con: estado por categoría, **timestamp**, **versión del texto/CMP** y ámbito de país. **[OBLIGACIÓN — prueba del consentimiento, GDPR 7.1]**
6. **Registro server-side de prueba de consentimiento** (modelo en DB inexistente hoy — C-04): guardar `{ userId?/anonId, categorías, timestamp, versión, país, user-agent mínimo }`. Minimizar datos. **[OBLIGACIÓN]**
7. **Re-consentimiento:** volver a solicitar si cambia la versión de la CMP o transcurre el periodo definido (p. ej. re-preguntar a los **6-12 meses**; fijar valor con Legal). **[BUENA PRÁCTICA]**

### 2.3 Retirar el consentimiento produce efecto operativo real

8. Al retirar una categoría, la CMP debe: emitir `gtag('consent','update',{…denied})`, **dejar de cargar** los scripts de esa categoría en la navegación siguiente y **borrar las cookies** ya fijadas de esa categoría (`_ga`, `_ga_*`, `_gid`, `_gat`) en el dominio. **[OBLIGACIÓN — revocable tan fácil como se otorgó]**
9. **Punto de acceso permanente:** un enlace/botón "Preferencias de cookies" siempre disponible (footer) que reabre el centro de preferencias. **[OBLIGACIÓN]**

### 2.4 Señales del navegador (EE. UU.)

10. **Honrar Global Privacy Control (GPC)** y Universal Opt-Out Mechanisms donde aplique (CO, CT y otros): si el navegador envía `Sec-GPC: 1` / `navigator.globalPrivacyControl === true`, tratar como opt-out de venta/compartición y de publicidad dirigida para ese usuario, sin banner adicional. **[OBLIGACIÓN si el estado cubre — US matrix §17-19]**
11. **"Do Not Sell or Share my Personal Information":** enlace/preferencia disponible para residentes de EE. UU. si GA4/GTM llega a constituir "sale"/"share" (a confirmar — [SUPUESTO]).

---

## 3. Diseño del banner (primera capa) y centro de preferencias (segunda capa)

### 3.1 Banner (primera capa) — textos mínimos y controles

- **Texto mínimo (ejemplo, adaptar por Legal e idioma/país):**
  > "Usamos cookies necesarias para que Hireeo funcione y, con tu permiso, cookies de analítica y marketing para mejorar el servicio y medir su uso. Puedes aceptar, rechazar o configurar tus preferencias. Más información en la [Política de cookies]."
- **Botones (jerarquía y visibilidad idénticas):** **[Aceptar todo]** · **[Rechazar todo]** · **[Configurar]**. Prohibido: "Rechazar" oculto, en segunda capa, con menor contraste o como texto pequeño. **[OBLIGACIÓN — rechazo equivalente, sin dark patterns]**
- **Sin casillas premarcadas** para analítica/marketing (arrancan desmarcadas). **[OBLIGACIÓN]**
- **No condicionar el acceso** al sitio a aceptar cookies no esenciales (no cookie wall; el criterio "consent or pay" de la CEPD requiere análisis específico si alguna vez se considerara). **[OBLIGACIÓN/GUÍA]**
- Multi-país / i18n: el banner respeta el país (`hireeo_country` / proxy) e idioma (`x-hireeo-lang`), pero **el bloqueo previo se aplica siempre** (más simple y seguro que geo-condicionar).

### 3.2 Centro de preferencias (segunda capa)

- Toggle por categoría (necesarias mostradas como "siempre activas", no desactivables).
- **Lista de cookies/servicios por categoría** con: proveedor, finalidad, duración y país/transferencia (tomados de la tabla maestra de `./cookie-and-tracker-audit.md` §1). **[OBLIGACIÓN — informado]**
- Botones **[Guardar preferencias]**, **[Aceptar todo]**, **[Rechazar todo]**.
- Enlace a **Política de cookies** y a **Política de privacidad**.
- Accesible: navegable por teclado, foco visible, roles ARIA, contraste WCAG 2.2 AA (coherente con EAA — `spain-eu.md` §6). **[OBLIGACIÓN EAA / BUENA PRÁCTICA]**

---

## 4. Criterios de aceptación verificables/testeables

> Formato: **CA-n — condición Given/When/Then**, automatizable con test E2E (Playwright/chrome-devtools) inspeccionando red y cookies. Estos criterios cierran la brecha C-01…C-04.

| ID | Criterio de aceptación (verificable) | Cómo se prueba |
|---|---|---|
| **CA-1** | **En la primera visita, antes de cualquier interacción, NO existe ninguna petición a `googletagmanager.com/gtm.js`, `googletagmanager.com/gtag/js` ni `google-analytics.com`, y NO existe ninguna cookie `_ga`, `_ga_*`, `_gid`, `_gat`.** | E2E: cargar `/es` en contexto limpio; assert sobre `list_network_requests` (0 matches Google analytics) y sobre `document.cookie` (0 cookies GA). |
| **CA-2** | El banner aparece en la primera visita con **[Aceptar todo]**, **[Rechazar todo]** y **[Configurar]** visibles en la misma capa y con igual jerarquía. | Snapshot de accesibilidad: los 3 controles presentes, mismo nivel de foco/contraste. |
| **CA-3** | Al pulsar **[Rechazar todo]**, el banner se cierra y **siguen sin cargarse** GTM/GA4 ni fijarse cookies de analítica/marketing en la navegación posterior. | E2E: click rechazar → navegar a otra ruta → assert 0 peticiones Google, 0 cookies GA. |
| **CA-4** | Al pulsar **[Aceptar todo]**, se emite `gtag('consent','update',{analytics_storage:'granted',...})` y **entonces** se cargan GA4/GTM y aparecen sus cookies. | E2E: click aceptar → assert petición a `gtm.js`/`gtag/js` y cookie `_ga` presente; inspeccionar `dataLayer` para el evento `consent update`. |
| **CA-5** | Existe `gtag('consent','default',{... 'denied'})` **antes** de cualquier carga de GTM/GA4 (Consent Mode v2). | Inspección del orden de scripts y del `dataLayer` inicial; assert estado `denied` por defecto. |
| **CA-6** | La elección se **persiste**: al recargar, no reaparece el banner y se respeta la preferencia previa (con timestamp y versión). | E2E: aceptar/rechazar → recargar → banner ausente; inspeccionar cookie `hireeo_consent` con `{timestamp, version, categorías}`. |
| **CA-7** | Existe un punto de acceso permanente ("Preferencias de cookies") que reabre el centro de preferencias desde cualquier página (footer). | E2E: click en el enlace del footer en varias rutas → se abre el centro. |
| **CA-8** | Al **retirar** la categoría analítica desde el centro, se emite `consent update denied`, dejan de cargarse los scripts y **se eliminan** las cookies `_ga*` del dominio. | E2E: aceptar → abrir preferencias → desactivar analítica → guardar → assert cookies GA eliminadas y 0 peticiones Google tras recargar. |
| **CA-9** | Ninguna casilla de analítica/marketing está **premarcada** en el centro de preferencias en la primera visita. | Snapshot: toggles analytics/marketing en `off`. |
| **CA-10** | Con **GPC activo** (`Sec-GPC: 1`), el usuario de EE. UU. queda en opt-out de venta/compartición y publicidad dirigida sin acción adicional (analítica/marketing no se activan). | E2E con header `Sec-GPC: 1` → assert marketing/venta desactivados; registrar la señal. |
| **CA-11** | Existe **registro server-side** de prueba de consentimiento (categorías + timestamp + versión + país), minimizado. | Test de integración: aceptar → verificar registro creado; verificar que no almacena datos excesivos. |
| **CA-12** | Existe **Política de cookies dedicada** enlazada desde el banner y el footer (hoy el footer enlaza a `/privacy` — C-05). | Verificar ruta de política de cookies y que los enlaces apuntan a ella. |
| **CA-13** | El banner y el centro son **accesibles** (teclado, foco visible, roles ARIA, contraste AA). | Auditoría a11y (axe/lighthouse) sobre el componente. |
| **CA-14** | **[Marketing — CONDITIONAL]** Si se habilita cualquier canal de email/SMS/push comercial, existe un **centro de preferencias de comunicaciones** con opt-out granular y baja efectiva (≤10 días hábiles CAN-SPAM; art. 27 AR). | Test del flujo de baja cuando exista el canal; hasta entonces, N/A documentado. |

---

## 5. Alcance de la solución por país (resumen operativo)

| País | ¿Bloqueo previo obligatorio? | ¿GPC/opt-out? | Nota |
|---|---|---|---|
| **es** (UE) | **Sí — hoy** | — | Bloqueador de lanzamiento; Consent Mode v2 |
| **cl** | **Sí — desde 2026-12-01** (Ley 21.719, opt-in + revocación fácil, banner SERNAC) | — | Aplicar ya por diseño único; validar estándar con la nueva Agencia |
| **ar** | Prudente (CMP + bloqueo previo como control) | — | Sin regla ePrivacy nacional; opt-out de marketing + No Llame si hay telefonía |
| **uy** | Prudente (deshabilitar GTM/GA4 hasta elección) | — | Base finalidad/consentimiento Ley 18.331 |
| **us** | No hay "consentimiento previo" UE | **Sí** (honrar GPC/UOOM; Do Not Sell/Share) | Activar opt-out por estado si GA4/GTM = sale/share |

> **Decisión de arquitectura recomendada [BUENA PRÁCTICA]:** implementar **un único comportamiento global** (bloqueo previo + Consent Mode v2 + honrar GPC) en lugar de geo-condicionar. Satisface el estándar más alto (ES/UE), cubre Chile 2026-12-01, es prudente para AR/UY y añade el opt-out/GPC de EE. UU. Menos superficie, menos errores, cumplimiento uniforme.

---

## 6. Dependencias y decisiones requeridas

- **[[DECISION REQUIRED]]** ¿CMP propia o de proveedor (p. ej. una consent platform)? Cualquier proveedor de CMP añade un **subprocesador** y debe integrarse en `vendors-and-transfers/` con su DPA.
- **[SUPUESTO C-07]** Auditar el contenido real del contenedor **GTM `GTM-PT2PFWF9`** antes de clasificar sus tags como analítica o marketing.
- **[SUPUESTO Q9]** Confirmar **DPF/DPA/SCC** con Google para legitimar la transferencia a EE. UU. incluso tras el consentimiento (`spain-eu.md` §4.4).
- Fijar con Legal: **texto exacto** del banner por idioma/país, **periodo de re-consentimiento**, y **estándar chileno definitivo** bajo Ley 21.719.
- Coordinar con la **Política de cookies** y la **Política de privacidad** (Fase 14, `legal-documents/`), que deben reflejar exactamente el inventario de `./cookie-and-tracker-audit.md`.

---

## 7. Revisión por abogado local pendiente

Antes de publicar: validar textos y jerarquía del banner en ES/UE (AEPD), el estándar de cookies de Chile bajo Ley 21.719 y recomendaciones SERNAC, la interpretación de AAIP (AR) y URCDP (UY) sobre bloqueo previo, y la calificación de GA4/GTM como "sale/share" bajo cada ley estatal de EE. UU. Ningún criterio de aceptación de este documento sustituye esa validación.
