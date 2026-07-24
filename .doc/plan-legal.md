# Plan de implementación — Páginas legales multi-país (Hireeo)

> Runbook ejecutable. Pensado para repartirse entre dos motores de IA:
> - **Claude Code / Sonnet 5** → arquitectura, decisiones, refactors, QA (fases 0, 1 y 4).
> - **OpenCode / MiniMax-M3** → scaffolding repetitivo y redacción masiva de contenido (fases 2 y 3).
>
> Fuente: `.doc/legal-research/` (86 archivos, investigación legal v1.0, corte 2026-07-23). Ningún texto de este plan es asesoría legal — todo el contenido nuevo debe pasar por revisión de abogado local antes de publicarse.

---

## 1. Contexto

`.doc/legal-research/` identificó que Hireeo necesita **11 páginas públicas legales** (nuevas o corregidas) para operar en `cl/ar/uy/es/us`, y que el código actual tiene gaps concretos:

- `/terms` y `/privacy` existen (`frontend/src/app/(country)/[country]/(public)/(estaticas)/{terms,privacy}/page.tsx`) pero **duplican texto completo por país** dentro de `frontend/src/lib/i18n/locales/{cl,ar,uy,es,us}.json` (cl/ar: 7-9 secciones; uy/es: 6; us: en inglés) — sin ningún mecanismo de herencia, lo que ya produjo inconsistencias (contradicción "no somos intermediarios / sin comisiones" vs. escrow del 15%, cláusula de disputas idéntica en las 5 jurisdicciones cuando el arbitraje solo es ejecutable en US).
- El link "Cookies" del Footer (`Footer.tsx:150`) apunta a `link('/privacy')` — no existe página propia.
- `LegalDocument.tsx` (único componente compartido de render) detecta la sección de contacto comparando el **texto literal** del título (`isContactSection()`) — fragil, se rompe si se traduce el título.
- No existe `features/legal/` como dominio.

Los documentos de investigación **no traen cifra de costo monetario**, solo niveles de esfuerzo cualitativo (Bajo/Medio/Alto) por obligación. La estimación de esfuerzo de este plan es propia (sección 3).

---

## 2. Alcance

### Dentro de alcance (este plan)
Las 11 páginas públicas legales, su arquitectura de contenido por país, y el Footer/índice que las enlaza.

### Fuera de alcance (explícito — no tocar en este plan)
- CMP/banner de consentimiento de cookies funcional (gating real de GTM/GA4 — hoy cargan sin gate en `frontend/src/app/layout.tsx:168-217`). Es una feature de ingeniería aparte, bloqueante para España/UE pero distinta de "escribir la página de cookies".
- Hallazgos CRITICAL/HIGH de `.doc/legal-research/code-audit/00-repository-inventory.md`: escrow stub (`backend/src/modules/escrow/escrow.service.ts`), firma de webhook MercadoPago (`frontend/src/app/api/webhooks/mercadopago/route.ts`), IDOR en `users.controller.ts`, KYC stub, ausencia de barrera de edad. Son ingeniería de cumplimiento, no páginas legales.
- Documentos 13-18 del expediente (retención/eliminación interna, respuesta a incidentes, DPA/subencargados, marketing/consentimiento, matriz de contratos corporativos): son gobernanza interna, no páginas públicas.
- Redacción "final, lista para publicar": todo el contenido nuevo debe llevar marcadores visibles de pendiente mientras las preguntas bloqueantes (sección 7) sigan sin resolver.

---

## 3. Estimación de TIEMPO (propia — no hay cifra en los docs de investigación)

Ejecutan agentes de IA, no un desarrollador humano escribiendo a mano — la unidad relevante es tiempo de reloj, no "días-persona".

| Fase | Contenido | Motor | Tiempo de generación | Revisión humana necesaria |
|---|---|---|---|---|
| 0 — Fundaciones | Schema Zod, resolver, refactor `LegalDocument`, migrar terms/privacy | Sonnet 5 | ~1–2 h (una sesión continua) | Lectura del diff antes de pasar a fase 1 |
| 1 — Patrón de página | `page.tsx` de `/cookies` + Footer + índice `/legal` | Sonnet 5 | ~20–30 min | Confirmar que el patrón es el que se quiere replicar |
| 2 — Scaffolding de rutas | 9 `page.tsx` restantes, replicando el patrón | MiniMax-M3 | ~15–30 min (1 sesión de OpenCode, las 9 tareas en batch) | Chequeo rápido de que compilan |
| 3 — Redacción de contenido | 11 docs × 5 países = 55 combinaciones país×doc | MiniMax-M3 | ~10–20 min por documento → 2–4 h total | La más pesada: leer cada uno de los 11 documentos antes de aprobar (es contenido legal, no conviene aprobar en bloque sin leer) |
| 4 — QA | lint + build, revisión visual, banners de borrador, nota SitesDoc | Sonnet 5 | ~30–60 min | Revisión visual humana de al menos las 4 páginas críticas (terms, privacy, cookies, accessibility) en los 5 países |

**Generación bruta: ~4–7 horas.** Corriendo fase 2 y 3 en paralelo (dos terminales de OpenCode) mientras Sonnet cierra fase 0/1, y sumando tu tiempo de revisión entre fases: **una jornada intensa (6–8 h) si se corre todo en un día**, o 2–3 días calendario si se reparte en sesiones cortas — pero el trabajo efectivo real ronda las 6–10 horas, no una semana de desarrollador.

**No incluido en esta cifra** (el costo real más grande del proyecto, no estimable por mí):
- Revisión de abogado local en las 5 jurisdicciones antes de publicar cualquier página.
- Los hallazgos CRITICAL/HIGH de ingeniería de cumplimiento listados en "Fuera de alcance".

---

## 4. Arquitectura técnica

Dominio nuevo `features/legal/` (regla de carpetas de `CLAUDE.md`), modelo **núcleo global + anexo por país**, tipado con Zod — reemplaza la duplicación completa por país que hoy vive en los JSON de i18n.

```
features/legal/
├── components/
│   └── LegalDocument/LegalDocument.tsx     # migrado desde shared/components/legal/
├── content/
│   ├── schema.ts
│   └── <doc-id>/
│       ├── base.ts
│       └── countries/{cl,ar,uy,es,us}.ts
├── lib/
│   ├── getLegalDocument.ts
│   └── registry.ts
└── types/legalTypes.ts
```

### 4.1 Schema (`features/legal/content/schema.ts`)

```ts
import { z } from 'zod';

export const legalSectionSchema = z.object({
    id: z.string(), // kebab-case estable, ej: "dispute-resolution" — NUNCA usar el título para lógica
    title: z.string(),
    kind: z.enum(['paragraph', 'list', 'contact', 'pending']).default('paragraph'),
    intro: z.string().optional(),
    content: z.string().optional(),
    items: z.array(z.string()).optional(),
    note: z.string().optional(), // texto del marcador [[DECISION REQUIRED: ...]] cuando kind === 'pending'
});

export const legalDocumentBaseSchema = z.object({
    docId: z.string(),
    title: z.string(),
    lastUpdated: z.string(),
    sections: z.array(legalSectionSchema),
    footer: z.string().optional(),
});

export const countryOverrideSchema = z.object({
    lastUpdated: z.string().optional(),
    replace: z.record(z.string(), legalSectionSchema).optional(), // sectionId -> override completo
    append: z.array(legalSectionSchema).optional(), // secciones-anexo exclusivas del país, van al final
});

export type LegalSection = z.infer<typeof legalSectionSchema>;
export type LegalDocumentBase = z.infer<typeof legalDocumentBaseSchema>;
export type CountryOverride = z.infer<typeof countryOverrideSchema>;
```

### 4.2 Resolver (`features/legal/lib/getLegalDocument.ts`)

```ts
import { REGISTRY } from './registry';
import type { LegalSection } from '../content/schema';

export function getLegalDocument(docId: string, country: string) {
    const entry = REGISTRY[docId];
    const override = entry.countries[country];
    const sections: LegalSection[] = entry.base.sections.map((section) => override?.replace?.[section.id] ?? section);
    if (override?.append?.length) sections.push(...override.append);
    return {
        ...entry.base,
        lastUpdated: override?.lastUpdated ?? entry.base.lastUpdated,
        sections,
    };
}
```

`registry.ts` mapea cada `docId` (`terms`, `privacy`, `cookies`, `provider-terms`, `ai-policy`, `acceptable-use`, `trust-and-safety`, `reviews-and-ranking`, `ip-copyright`, `security`, `accessibility`) a su `base` + los 5 `countries`.

### 4.3 Refactor de `LegalDocument.tsx`

- Reemplazar `isContactSection()`/`splitContactContent()` (matching por texto de título) por `section.kind === 'contact'`.
- Agregar render para `kind === 'pending'`: callout visible (fondo ámbar, ícono de advertencia) mostrando `section.note`.
- Agregar banner superior (antes del título): si `sections.some(s => s.kind === 'pending')`, mostrar `"BORRADOR — Pendiente de revisión legal"` de forma no removible por el usuario final.

### 4.4 Patrón de página (ejemplo `/cookies`)

```tsx
// frontend/src/app/(country)/[country]/(public)/(estaticas)/cookies/page.tsx
import { getLegalDocument } from '@/features/legal/lib/getLegalDocument';
import { LegalDocument } from '@/features/legal/components/LegalDocument/LegalDocument';

export default async function CookiesPage({ params }: { params: Promise<{ country: string }> }) {
    const { country } = await params;
    const doc = getLegalDocument('cookies', country);
    return <LegalDocument eyebrow="Política de cookies" {...doc} />;
}
```

Este es el patrón EXACTO a replicar en fase 2 — solo cambian `docId` y `eyebrow`.

---

## 5. Las 11 páginas

Todas bajo `frontend/src/app/(country)/[country]/(public)/(estaticas)/`, mismo nivel que `terms`/`privacy` hoy (no anidar bajo `/legal/` para no romper URLs existentes).

| # | Ruta | `docId` | Eyebrow | Fuente en `.doc/legal-research/legal-documents/` | Estado |
|---|---|---|---|---|---|
| 1 | `/terms` | `terms` | Términos y condiciones | `01-terms-of-service.md` | Corregir |
| 2 | `/privacy` | `privacy` | Política de privacidad | `03-privacy-policy.md` + `04-us-privacy-notice.md` | Corregir |
| 3 | `/cookies` | `cookies` | Política de cookies | `05-cookie-policy.md` | Nueva (ejemplo canónico, fase 1) |
| 4 | `/provider-terms` | `provider-terms` | Términos para prestadores | `02-provider-terms.md` | Nueva |
| 5 | `/ai-policy` | `ai-policy` | Uso de inteligencia artificial | `06-ai-policy.md` | Nueva |
| 6 | `/acceptable-use` | `acceptable-use` | Política de uso aceptable | `07-acceptable-use-policy.md` | Nueva |
| 7 | `/trust-and-safety` | `trust-and-safety` | Confianza y seguridad | `08-trust-and-safety.md` | Nueva |
| 8 | `/reviews-and-ranking` | `reviews-and-ranking` | Reseñas y posicionamiento | `09-reviews-ranking-advertising.md` | Nueva |
| 9 | `/ip-copyright` | `ip-copyright` | Propiedad intelectual y derechos de autor | `10-ip-copyright-dmca.md` | Nueva |
| 10 | `/security` | `security` | Seguridad y divulgación responsable | `11-security-disclosure.md` | Nueva |
| 11 | `/accessibility` | `accessibility` | Accesibilidad | `12-accessibility-statement.md` | Nueva (obligatoria hoy en España/UE) |

**Footer** (`frontend/src/shared/components/layout/Footer/Footer.tsx`): corregir línea ~150 (`link('/privacy')` → `link('/cookies')`), agregar columna "Legal" con Términos/Privacidad/Cookies/Accesibilidad, y crear `/legal` (página índice que enlaza las 11) para no saturar el footer con las 7 restantes.

---

## 6. Fases, dependencias y asignación de motor

```
Fase 0 (Sonnet) ──► Fase 1 (Sonnet) ──┬─► Fase 2 (MiniMax-M3) ──┐
                                       │                          ├─► Fase 4 (Sonnet)
                                       └─► Fase 3 (MiniMax-M3) ──┘
```

Fases 2 y 3 son independientes entre sí una vez cerrada la fase 1 → pueden correr en paralelo (dos sesiones de OpenCode) si se quiere ir más rápido; se documentan en orden secuencial por defecto.

### Fase 0 — Fundaciones (Sonnet 5)
1. Crear estructura `features/legal/{components,content,lib,types}/`.
2. Escribir `content/schema.ts` (sección 4.1).
3. Migrar `LegalDocument.tsx` de `shared/components/legal/` a `features/legal/components/LegalDocument/` con el refactor de la sección 4.3.
4. Escribir `lib/getLegalDocument.ts` + `lib/registry.ts` (sección 4.2).
5. Migrar el contenido YA EXISTENTE de `terms`/`privacy` (los 5 JSON de i18n) al nuevo formato base+anexo:
   - Corregir la contradicción "no somos intermediarios / sin comisiones" (citada como RISK-01 blocking en `.doc/legal-research/05-risk-matrix.md`).
   - Separar la cláusula de disputas (§7) en `base.ts` (texto neutro) + override por país: US usa arbitraje vinculante + renuncia a acción de clase (válido, FAA); CL/AR/UY/ES deben ofrecer vía judicial/organismo de consumo local, NO arbitraje único.
6. Actualizar `terms/page.tsx` y `privacy/page.tsx` para usar `getLegalDocument()` en vez de `getDictionary(country).pages.{terminos,privacidad}`.

### Fase 1 — Patrón de página (Sonnet 5)
1. Crear `content/cookies/base.ts` + `content/cookies/countries/{cl,ar,uy,es,us}.ts` (contenido real, no placeholder — es el ejemplo canónico).
2. Crear `cookies/page.tsx` (sección 4.4).
3. Actualizar `Footer.tsx`: fix link cookies, columna "Legal", link a `/legal`.
4. Crear `/legal/page.tsx` (índice con las 11 páginas, agrupadas por tema).
5. Congelar el patrón de páginas 2-11 como plantilla para el brief de fase 2.

### Fase 2 — Scaffolding de rutas (MiniMax-M3)

**Brief a pegar en OpenCode** (una vez por página; solo cambian docId/ruta/eyebrow de la tabla de la sección 5):

> Contexto: proyecto Next.js 16 App Router, dominio `features/legal/` ya existe con `getLegalDocument()` y `LegalDocument` component (ver `frontend/src/app/(country)/[country]/(public)/(estaticas)/cookies/page.tsx` como ejemplo EXACTO a replicar — no inventar variantes).
> Tarea: crear `frontend/src/app/(country)/[country]/(public)/(estaticas)/<ruta>/page.tsx` idéntico en estructura al de `cookies/page.tsx`, cambiando únicamente `getLegalDocument('<docId>', country)` y el `eyebrow="<Eyebrow>"`.
> Checklist de aceptación: (1) Server Component async con `params: Promise<{ country: string }>`; (2) usa `getLegalDocument` y `LegalDocument`, sin lógica adicional; (3) `pnpm --filter frontend build` no rompe por este archivo.

Repetir para las 9 filas restantes de la tabla (sección 5, filas 4-11 excepto la ya hecha `cookies`).

### Fase 3 — Redacción de contenido (MiniMax-M3)

**55 combinaciones** (11 docs × 5 países). Para cada documento, el brief a pegar en OpenCode debe incluir:

1. **Entrada**: `.doc/legal-research/legal-documents/<NN-nombre>.md` (leer completo).
2. **Salida**: `features/legal/content/<docId>/base.ts` (secciones comunes a las 5 jurisdicciones) + `features/legal/content/<docId>/countries/{cl,ar,uy,es,us}.ts` (overrides).
3. **Schema a seguir**: pegar el contenido literal de `features/legal/content/schema.ts` (sección 4.1) — MiniMax debe generar objetos que tipen contra ese schema, sin campos extra.
4. **Regla de `[[DECISION REQUIRED: ...]]`**: cualquier marcador de ese tipo en el `.md` fuente se convierte en una sección con `kind: 'pending'` y `note` = el texto exacto del marcador. Nunca inventar la respuesta.
5. **Reglas de país** (tabla siguiente) — para no releer todo `country-analysis/` en cada sesión de MiniMax:

   | País | Autoridad de control | Plazo de derechos | Retracto/desistimiento B2C | Cláusula de disputas |
   |---|---|---|---|---|
   | `cl` | Hoy: sin agencia dedicada (Ley 19.628). Desde 2026-12-01: Agencia de Protección de Datos Personales bajo Ley 21.719 | 2 días hábiles (ARCO, régimen actual) | 10 días (Ley 19.496 art. 43, responsabilidad directa del intermediario) | Vía judicial/SERNAC, no arbitraje único |
   | `ar` | AAIP | Acceso 10 días corridos; rectificación/supresión 5 días hábiles | Botón de Arrepentimiento + 10 días (Ley 24.240) | Vía judicial/Defensa del Consumidor, responsabilidad solidaria art. 40 LDC |
   | `uy` | URCDP | 5 días hábiles (el más corto de las 5) | 5 días hábiles (Ley 17.250); renovación automática sin preaviso PROHIBIDA (Ley 20.212) | Vía judicial/URCDP |
   | `es` | AEPD (representante UE art. 27 GDPR si no establecido en UE) | 1 mes (GDPR art. 12) | 14 días (Directiva 2011/83+Omnibus) | Vía judicial/ODR (Reglamento 524/2013), no arbitraje único |
   | `us` | Sin autoridad federal única; CCPA/CPRA (California) + estados (CO/CT/TX/UT/OR) | Variable por estado, verificar antes de publicar | Sin derecho federal de cooling-off | Arbitraje vinculante + renuncia a acción de clase VÁLIDA (FAA, *AT&T Mobility v. Concepcion*) |

6. **Checklist de aceptación por combinación**: (a) valida contra `schema.ts` sin `any`; (b) no duplica en el país texto que ya está en `base.ts`; (c) toda cita normativa coincide con la tabla anterior o con el `.md` fuente; (d) cualquier dato no confirmable (razón social, DPO, dirección, fechas de vigencia reales) queda como sección `kind:'pending'`.

Mapeo completo doc→archivos ya está en la tabla de la sección 5.

### Fase 4 — QA (Sonnet 5)
1. `pnpm lint && pnpm build` (obligatorio por `CLAUDE.md` del proyecto tras cualquier cambio en `frontend/`).
2. Revisión visual de las 11 páginas × 5 países (al menos las 4 más críticas: terms, privacy, cookies, accessibility).
3. Confirmar que ninguna página con secciones `kind:'pending'` se quede sin el banner de borrador visible.
4. Actualizar la nota del proyecto en el vault SitesDoc (`~/SitesDoc/nextjs_projects/next-atlas-services/next-atlas-services.md`) documentando el cambio de arquitectura de contenido legal.

---

## 7. Preguntas bloqueantes (Q1-Q5) — deben resolverse antes de PUBLICAR, no antes de construir

De `.doc/legal-research/01-scope-assumptions-and-open-questions.md`:

- **Q1**: razón social, país de constitución, domicilio y representante legal de Hireeo.
- **Q2**: merchant of record cuando el escrow salga de stub; quién retiene la comisión del 15%.
- **Q3**: rol de Hireeo (responsable/controlador vs. encargado) en cada tratamiento.
- **Q4**: términos de entrenamiento del contrato con Google Gemini (¿prohíbe entrenar con inputs/outputs?).
- **Q5**: región de hosting de PostgreSQL/backups/Cloudinary.

Mientras estas 5 sigan sin respuesta, todo el contenido generado en fase 3 debe mantener las secciones correspondientes como `kind:'pending'` — la arquitectura (fases 0-2) se construye igual, mostrar el aviso de borrador que exige la regla del proyecto.

---

## 8. Verificación

- El código pasa `pnpm lint && pnpm build` en `frontend/` después de cada fase.
- Las 11 rutas resuelven para los 5 países sin 404 ni contenido vacío.
- `getLegalDocument()` lanza error explícito si `docId` o `country` no existen en el registry (fail-fast, no fallback silencioso).
- Ninguna página pública queda con contenido "pending" sin el banner de borrador.
