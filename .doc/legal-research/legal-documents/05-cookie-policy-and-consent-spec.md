# Política de Cookies — Texto de banner y especificación de centro de preferencias

**Documento:** `legal-documents/05-cookie-policy-and-consent-spec.md`
**Audiencia:** todos los usuarios/visitantes del sitio de Hireeo.
**Jurisdicción/cobertura:** global, con estándar más exigente de España/UE aplicado a todos los países (ver `cookies/consent-design-spec.md` §5, decisión de arquitectura recomendada).
**Versión:** v0.1-borrador
**Fecha de vigencia propuesta:** **no puede publicarse antes de que se implemente la CMP** descrita en `cookies/consent-design-spec.md` — publicar este texto sin la implementación técnica documentaría un incumplimiento en vez de resolverlo.
**Dependencias técnicas:** implementación completa de `cookies/consent-design-spec.md` (retirar carga incondicional de GTM/GA4 de `layout.tsx:170-207`, Consent Mode v2, registro de consentimiento).

> ⚠️ **BORRADOR DE TRABAJO.** El inventario de cookies/trackers de este documento es el **real y verificado** de `cookies/cookie-and-tracker-audit.md` — no se inventó ningún elemento. **No agregar cookies o proveedores que no estén en ese inventario.**

---

## 1. Tabla de cookies y trackers (copiada del inventario verificado, no inventada)

### 1.1 Analítica (requiere consentimiento)

| Proveedor | Nombre | Finalidad | Duración | Transferencia |
|---|---|---|---|---|
| Google (Analytics 4) | `_ga` | Distinguir usuarios | 2 años | EE.UU. |
| Google (Analytics 4) | `_ga_<container-id>` | Persistir sesión GA4 | 2 años | EE.UU. |
| Google (GA4/UA) | `_gid` | Distinguir usuarios | 24 horas | EE.UU. |
| Google (GA4/UA) | `_gat` / `_gat_gtag_*` | Limitar tasa de peticiones | ~1 minuto | EE.UU. |

### 1.2 Marketing / publicidad (requiere consentimiento)

| Proveedor | Nombre | Finalidad |
|---|---|---|
| Google (Tag Manager) | Contenedor `GTM-...` | Puede orquestar tags de marketing adicionales — **contenido exacto del contenedor pendiente de auditoría** (`cookies/cookie-and-tracker-audit.md` C-07, `[SUPUESTO]`) |

[[DECISION REQUIRED: antes de publicar, Marketing/Ingeniería deben auditar el contenido real del contenedor de Google Tag Manager y confirmar si carga tags adicionales de publicidad — no se puede afirmar en la política qué contiene un contenedor sin auditarlo]].

### 1.3 Estrictamente necesarias (no requieren consentimiento, sí divulgación)

| Proveedor | Nombre | Finalidad | Duración |
|---|---|---|---|
| Hireeo | Cookie de país (routing multi-país) | Recordar el país elegido | 1 año |
| Hireeo (NextAuth) | Cookie de sesión | Autenticación | 30 días |
| Hireeo | Almacenamiento de sesión del navegador | No repetir animación de introducción | Sesión del navegador |

### 1.4 Terceros de funcionalidad (mapas/geocodificación — no son cookies, requieren aviso de tercero)

| Proveedor | Finalidad | Nota |
|---|---|---|
| OpenStreetMap (Nominatim) | Convertir coordenadas en dirección y viceversa | Recibe coordenadas e IP al usar la búsqueda por ubicación |
| OpenStreetMap (tiles) | Mostrar el mapa | Solo en el panel de administración |
| Cloudflare (cdnjs) | Iconos del mapa | Solo en el panel de administración |

## 2. Texto del banner (primera capa)

> "Usamos cookies necesarias para que Hireeo funcione y, con tu permiso, cookies de analítica y marketing para mejorar el servicio y medir su uso. Puedes aceptar, rechazar o configurar tus preferencias. Más información en esta Política de Cookies."

**Botones — misma jerarquía y visibilidad, según especificación ya validada técnicamente en `cookies/consent-design-spec.md` §3.1:**
- [Aceptar todo]
- [Rechazar todo]
- [Configurar]

**Reglas no negociables (ya especificadas técnicamente, se repiten aquí porque son también compromiso de cara al usuario):**
- Ninguna casilla de analítica o marketing viene premarcada.
- Rechazar es tan fácil y visible como aceptar.
- El acceso al sitio no está condicionado a aceptar cookies no esenciales.

## 3. Centro de preferencias (segunda capa)

- Un interruptor por categoría (necesarias: siempre activas, no desactivables).
- Lista de cookies por categoría con proveedor, finalidad, duración y país de transferencia (tabla de §1, debe mantenerse sincronizada con `cookies/cookie-and-tracker-audit.md` cada vez que ese inventario cambie).
- Botones: [Guardar preferencias], [Aceptar todo], [Rechazar todo].
- Enlace a esta Política de Cookies y a la Política de Privacidad (`03-privacy-policy-global.md`).

## 4. Señales del navegador (Estados Unidos)

> "Si tu navegador envía la señal Global Privacy Control (GPC), la respetaremos como una solicitud de exclusión de venta o compartición de datos y de publicidad dirigida, sin necesidad de que completes el centro de preferencias."

[[DECISION REQUIRED: esta cláusula depende de que se implemente el criterio de aceptación CA-10 de `cookies/consent-design-spec.md` §2.4 — no publicar esta promesa antes de que esté implementada]].

## 5. Cómo retirar tu consentimiento

> "Puedes cambiar tus preferencias en cualquier momento desde el enlace 'Preferencias de cookies' en el pie de página. Al retirar tu consentimiento para una categoría, dejaremos de cargar esos servicios y eliminaremos las cookies correspondientes ya existentes."

[[DECISION REQUIRED: no publicar esta cláusula antes de que el criterio de aceptación CA-8 de `cookies/consent-design-spec.md` esté implementado — hoy no existe este comportamiento en el código]].

## 6. Corrección necesaria antes de que este documento tenga sentido

**Recordatorio explícito, no ambiguo:** a la fecha de este borrador, Google Tag Manager y Google Analytics 4 se cargan en `frontend/src/app/layout.tsx:170-207` **incondicionalmente, sin ningún gate de consentimiento**. Publicar esta Política de Cookies sin haber corregido eso primero sería contradictorio: el texto prometería un comportamiento que el código no tiene. **El orden correcto es: implementar `cookies/consent-design-spec.md` primero, publicar este documento después.**

---

## Hechos que requieren confirmación antes de publicar

1. Contenido real del contenedor de Google Tag Manager (§1.2).
2. Implementación completa de la CMP antes de publicar cualquier parte de este texto (§6) — es la dependencia técnica central de todo el documento.
3. Implementación de las señales GPC (§4) y del efecto operativo de retirar consentimiento (§5).

## Revisión por abogado local pendiente

El inventario de cookies (§1) es un hecho técnico verificado y no requiere revisión legal adicional en cuanto a su exactitud. El texto del banner y del centro de preferencias (§2-3) debe revisarse contra la Guía AEPD 2024 (España), el estándar previsto en la Ley 21.719 de Chile (vigente 2026-12-01) y el criterio prudente de Argentina/Uruguay antes de publicarse — y, en cualquier caso, no antes de que la implementación técnica exista.
