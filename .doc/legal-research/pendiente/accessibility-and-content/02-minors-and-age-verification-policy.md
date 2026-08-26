# accessibility-and-content/02 — Política de menores y verificación de edad (Fase 13)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con IA (Gemini 2.5 Flash).
- **Fecha de corte / ejecución:** 2026-07-23
- **Versión:** 0.1 (borrador de investigación técnico-jurídica).
- **Insumos previos:** `../01-scope-assumptions-and-open-questions.md` (S5, Q6), `../02-product-and-data-map.md`, `../country-analysis/spain-eu.md` §1 (LOPDGDD art. 7, edad 14), `../country-analysis/united-states-federal.md` (COPPA <13), `../cookies/cookie-and-tracker-audit.md` (GTM/GA4 sin consentimiento — **no se repite**).

> **Aviso.** Documento de investigación, no asesoramiento legal. Requiere revisión de abogado habilitado por jurisdicción. Marcadores: **[HECHO]**, **[INFERENCIA]**, **[SUPUESTO]**, **[OBLIGACIÓN]**, **[BUENA PRÁCTICA]**.

---

## 0. Resumen ejecutivo

**Hecho crítico confirmado [HECHO]:** Hireeo **no tiene ningún control de edad**. No existe campo de fecha de nacimiento ni verificación de edad en el registro (cliente ni prestador), ni en el modelo `User`. Evidencia: búsqueda negativa `birthdate/fechaNacimiento/dateOfBirth` (`../01` §C); `backend/src/modules/auth/dto/register.dto.ts:14-40` (solo nombre, email, password, teléfono opcional, país); `frontend/src/features/auth/components/RegisterPage/RegisterPage.tsx:71-156` (el único checkbox obligatorio es aceptación de Términos, sin declaración de edad). Además, GTM/GA4, geolocalización precisa, chat e IA operan sin barrera de edad (`../cookies/cookie-and-tracker-audit.md`).

**Consecuencia:** es un riesgo **BLOCKING transversal**. Sin barrera de edad, Hireeo no puede acreditar que no recoge datos de menores → se activan **COPPA (EE. UU., <13)**, **LOPDGDD art. 7 (España, <14)** y los estándares de consentimiento de menores de CL/AR/UY. Recolectar identificadores persistentes, geolocalización y chat de un menor sin base válida es la exposición más directa.

**Recomendación núcleo:** el servicio **no está diseñado para menores** ([INFERENCIA] — servicios manuales contratados/prestados: electricistas, fletes, mudanzas). Fijar **edad mínima 18** para **todos** los usuarios (cliente y prestador) y aplicar un **age-gate neutral** proporcional, más un procedimiento de escalamiento ante conocimiento real de un menor. No se propone verificación de identidad robusta general (desproporcionada), salvo el KYC ya existente para prestadores.

---

## 1. Edad mínima por jurisdicción — marco y edad de consentimiento digital

> Dos conceptos distintos: (a) **edad de consentimiento digital** (por debajo requiere consentimiento parental para tratar datos con base en consentimiento); (b) **edad mínima contractual/de uso** que Hireeo fije en sus Términos. Hireeo puede fijar una edad mínima **superior** a la de consentimiento digital.

| Jurisdicción | Edad de consentimiento digital (datos) | Fundamento | Fuente |
|---|---|---|---|
| **EE. UU.** | **<13** = "child" bajo COPPA; tratamiento requiere consentimiento parental verificable y aviso directo | 15 USC §§6501-6506; 16 CFR Part 312 | `../country-analysis/united-states-federal.md` (COPPA, F-03/F-04) |
| **España** | **14** (menores de 14 requieren consentimiento de titulares de la patria potestad) | LOPDGDD **art. 7** | `../country-analysis/spain-eu.md` §1, §4 |
| **UE (GDPR base)** | 16 por defecto, **rebajable a 13** por cada Estado; España la fijó en 14 | GDPR **art. 8** | `../country-analysis/spain-eu.md` |
| **Chile** | Sin edad digital específica consolidada; Ley 21.719 (vigente **2026-12-01**) refuerza tratamiento de datos de NNA con interés superior del niño **[SUPUESTO — confirmar edad exacta con fuente primaria BCN]** | Ley 19.628 / Ley 21.719 | `../cookies/cookie-and-tracker-audit.md` §4 |
| **Argentina** | Capacidad progresiva CCyC; adolescentes ≥13 con matices; datos de menores con consentimiento parental salvo capacidad progresiva **[SUPUESTO — confirmar criterio AAIP]** | Ley 25.326; CCyC arts. 25-26 | pendiente country-analysis AR |
| **Uruguay** | Ley 18.331; tratamiento de datos de NNA sujeto a interés superior y representación **[SUPUESTO — confirmar guía URCDP]** | Ley 18.331 | pendiente country-analysis UY |

**Conclusión:** el estándar más restrictivo que fija una barrera clara es COPPA (<13) para "child-directed"; el más protector para el consentimiento es UE/España (14). Una **edad mínima única de 18 en Términos** supera todos los umbrales y simplifica el diseño multi-país, evitando gestionar consentimiento parental por debajo de 14/13/16 en cinco jurisdicciones.

---

## 2. Recomendación de edad mínima y método de verificación

### 2.1 Edad mínima recomendada — **18 años** (todos los usuarios)

- **Fundamento:** (i) la contratación de servicios (y, cuando salga de *stub*, el pago/escrow — `../01` §A) implica **capacidad de contratar**, que la mayoría de jurisdicciones sitúa en 18; (ii) los servicios pueden ejecutarse en el domicilio del usuario (geolocalización precisa `schema.prisma:522-523`), con riesgos de seguridad presencial impropios para menores; (iii) fijar 18 evita el régimen de consentimiento parental de menores en las cinco jurisdicciones.
- `[[DECISION REQUIRED]]` **Confirmación de negocio:** ¿18 para todos, o 18 para prestadores y 16/mayoría local para clientes? Recomendación técnica y legal: **18 uniforme**. Debe decidirlo el negocio antes de redactar Términos.

### 2.2 Método de verificación — **proporcional (age-gate declarativo + señales), NO verificación robusta general**

La verificación debe ser **proporcional al riesgo** (principio de minimización; criterio AEPD/EDPB y FTC). Escalado propuesto:

| Nivel | Mecanismo | Cuándo | Proporcionalidad |
|---|---|---|---|
| **1 — Age-gate declarativo** | Casilla/afirmación **"Confirmo que tengo 18 años o más"** obligatoria en el registro (no premarcada), + edad mínima en Términos. Opcionalmente, campo de fecha de nacimiento con validación ≥18 en el DTO. | En **todos** los registros (cliente y prestador) | Mínimo exigible; suficiente si el servicio **no** se dirige a menores y no hay conocimiento real. Es lo que hoy **falta**. |
| **2 — Señales de riesgo** | Bloqueo/《escalamiento》 si el comportamiento o los datos sugieren un menor (p. ej. declaración explícita en chat/IA, reporte de un tercero). | Continuo, reactivo | Evita "conocimiento real" no atendido (COPPA). |
| **3 — Verificación robusta** | Solo el **KYC de prestadores ya existente** (Stripe Identity, hoy stub — `kyc.service.ts`) confirma identidad/edad del prestador cuando se active. **No** se propone verificación documental general de clientes (desproporcionada para un marketplace de servicios). | Prestadores, al activar KYC | Reservado; no generalizar. |

> **[BUENA PRÁCTICA]** Un **campo de fecha de nacimiento con validación ≥18 en `register.dto.ts`** es preferible a una simple casilla, porque deja registro auditable de la afirmación de edad y permite bloquear en servidor. Hoy no existe (habría que añadir el campo — **cambio de producto, no incluido en esta auditoría; solo se recomienda**).

### 2.3 Consentimiento parental — cuándo se activaría

Con edad mínima 18 correctamente aplicada, el consentimiento parental **no debería activarse** (no hay usuarios <18 legítimos). Se activaría **solo** si el negocio decidiera admitir menores (p. ej. clientes 16-17): entonces, para España <14 y COPPA <13, se requeriría **consentimiento parental verificable** (aviso directo al progenitor + método de verificación aceptado). `[[DECISION REQUIRED]]` si se admite cualquier menor, definir el mecanismo de consentimiento parental por jurisdicción — decisión con impacto alto; recomendación: **no admitir menores**.

---

## 3. Categorías de contenido/servicios prohibidas para menores

Aunque con edad mínima 18 el punto es secundario, la **Política de Uso Aceptable** (Fase 14 §7) debe prohibir explícitamente, y el marketplace debe poder filtrar, servicios inapropiados o de riesgo para menores si alguno accediera: contenido sexual/para adultos, alcohol/tabaco, apuestas, armas, y cualquier servicio que exija contacto presencial no supervisado con un menor. Hoy **no existe whitelist ni prohibición de categorías en código** (`../01` S4, Q7): las categorías se cargan por seed/DB sin restricciones. **[SUPUESTO/HIGH]** — cruza con `marketplace/` (Trust & Safety, Fase 10).

---

## 4. Publicidad dirigida a menores

- La analítica GTM/GA4 carga **sin gate de consentimiento** y el contenedor GTM podría inyectar tags publicitarios no auditables (`../cookies/cookie-and-tracker-audit.md` C-01, C-07 — **no se repite**). Sin barrera de edad, **no se puede excluir** que se perfile o se dirija publicidad a un menor, lo que agrava el riesgo COPPA (monetización de datos infantiles, reforzada por la COPPA Rule 2025) y el régimen de menores UE.
- **Control [OBLIGACIÓN condicional]:** una vez implementados el age-gate (§2) y la CMP con Consent Mode (cookies), **no** activar publicidad conductual dirigida ni pasar datos a plataformas de ads respecto de cualquier usuario cuya edad no esté confirmada como adulto. Referencia a la corrección de cookies, que es prerrequisito.

---

## 5. Plan de escalamiento ante detección de un menor registrado

Procedimiento operativo mínimo (Trust & Safety + Privacy) **[BUENA PRÁCTICA / requerido para acreditar diligencia COPPA]**:

1. **Detección:** reporte de usuario, declaración en chat/IA, o señal de moderación indica que un titular es menor de la edad mínima.
2. **Congelación:** suspender la cuenta y **detener** todo tratamiento no esencial (analítica, IA, notificaciones) para ese usuario.
3. **Verificación proporcional:** solicitar confirmación de edad; si se confirma que es menor de la edad mínima, proceder a §4.
4. **Eliminación:** **borrar** los datos personales del menor (cuenta, mensajes, geolocalización, interacciones) usando el borrado en cascada (`onDelete: Cascade` desde `User` — `../02` §1) y registrar la acción en `IntegrationAuditLog`/registro de incidentes.
5. **Notificación:** valorar deber de notificación (COPPA no exige notificar a la autoridad por hallazgo aislado; GDPR/brechas puede aplicar si hubo tratamiento indebido — coordinar con Fase 11 `security/`).
6. **Prevención:** revisar por qué el age-gate no lo detuvo y ajustar.

> **[HECHO — brecha]** Hoy **no existe** endpoint de auto-borrado por el titular ni flujo documentado de eliminación por escalamiento (`../02` §1; `../country-analysis/spain-eu.md` §4.5). El plan anterior requiere que exista un flujo de eliminación real (Fase 4/11).

---

## 6. Matriz: obligación → evidencia → propietario → prioridad → fecha objetivo

| # | Acción | Norma | Evidencia repo | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|---|---|
| 1 | Definir edad mínima (recom. **18** uniforme) en Términos | COPPA / LOPDGDD 7 / consumo | ausencia (`register.dto.ts:14-40`) | Legal + Product | **P0** | Pre-lanzamiento / antes de tráfico US |
| 2 | Age-gate declarativo obligatorio en registro (cliente y prestador) | COPPA / GDPR-menores | `RegisterPage.tsx:130-156` (solo Términos) | Engineering + Product | **P0** | Pre-lanzamiento |
| 3 | (Recom.) Campo fecha de nacimiento + validación ≥18 en DTO | Minimización / prueba de edad | `register.dto.ts` | Engineering | P1 | Pre-lanzamiento |
| 4 | Flujo de escalamiento + eliminación de menor detectado | COPPA / accountability | sin flujo (`../02` §1) | Trust & Safety + Eng | P1 | Pre-lanzamiento |
| 5 | Prohibición de categorías/servicios inapropiados para menores | consumo / T&S | sin whitelist (S4/Q7) | Trust & Safety | P2 | Pre-lanzamiento |
| 6 | No dirigir publicidad conductual sin edad confirmada | COPPA / ePrivacy | cookies C-01/C-07 | Marketing + Eng | P1 | Con la CMP |

---

## 7. Preguntas abiertas / decisiones requeridas

- `[[DECISION REQUIRED]]` **Edad mínima definitiva** (recom. 18 uniforme) — decisión de negocio, bloquea Términos.
- `[[DECISION REQUIRED]]` **Método de verificación a implementar**: age-gate declarativo (casilla) vs. campo de fecha de nacimiento con validación en servidor (recomendado). Bloquea especificación de producto.
- `[[DECISION REQUIRED]]` Si se admitiera cualquier menor: mecanismo de **consentimiento parental verificable** por jurisdicción (recom.: no admitir menores).
- **[SUPUESTO]** Confirmar edad de consentimiento digital exacta en CL (Ley 21.719), AR (AAIP/CCyC) y UY (URCDP) con fuente primaria en los country-analysis respectivos.

---

## 8. Revisión por abogado local pendiente

Validar antes de publicar: edad mínima aplicable por jurisdicción y capacidad contractual; suficiencia del age-gate declarativo frente a "conocimiento real" bajo COPPA; edades de consentimiento digital en CL/AR/UY; y el procedimiento de eliminación/notificación ante detección de un menor. No presentar el age-gate declarativo como equivalente a verificación de edad certificada.
