# ai/ai-governance-framework — Marco de gobernanza de IA (Fase 6.2)

- **Fecha:** 2026-07-23 · **Versión:** 0.1
- **Ámbito:** los 6 sistemas de IA inventariados (A `ai-agents`, B `chatbot`, C–F frontend).
- **Insumos:** `ai-system-inventory.md`, `ai-classification-and-risk-assessment.md`.

> Marco **ejecutable** (no una política pública). Traduce las obligaciones vigentes (AI Act art. 4; GDPR; soft law AAIP/AGESIC/Chile) a roles, procesos y registros concretos. Etiquetas: **[OBLIGACIÓN]**, **[BUENA PRÁCTICA]**, **[[DECISION REQUIRED]]**.

---

## 1. Propósito legítimo y prohibiciones de uso

### 1.1 Usos permitidos (declarados)
La IA en Hireeo se usa **exclusivamente** para: (a) clasificar necesidades del usuario hacia categorías del catálogo; (b) sugerir prestadores existentes; (c) asistir la redacción de descripciones de servicios; (d) crear **borradores** de solicitud **con confirmación del usuario**. **[HECHO, del inventario]**

### 1.2 Prohibiciones de uso (vinculantes internamente)
La IA de Hireeo **NO debe** usarse para:
1. Tomar decisiones **consecuenciales** sobre acceso a empleo, crédito, vivienda, seguros, educación o servicios esenciales (evita Anexo III AI Act; Colorado AI Act; Texas TRAIGA). **[OBLIGACIÓN preventiva]**
2. **Filtrar, suspender o excluir prestadores** de forma automatizada y determinante sin revisión humana. **[OBLIGACIÓN preventiva]**
3. Procesar **datos de categorías especiales** (salud, biometría, ideología) ni datos de **menores** conocidos. **[OBLIGACIÓN]**
4. Generar afirmaciones no sustentadas ("verificado", "el mejor", "garantizado") sobre prestadores o servicios (FTC §5; consumo). **[OBLIGACIÓN]**
5. Crear registros en base de datos (`ServiceRequest`, `Quote`, u otros) **sin confirmación validada por código** del usuario. **[OBLIGACIÓN — hoy incumplida, ver AI-CHK-03]**
6. Producir deepfakes, suplantar personas o generar contenido prohibido (ver `ai-safety-security-and-misuse.md`). **[OBLIGACIÓN]**

### 1.3 Evaluación previa a lanzar una nueva función de IA (gate)
Antes de desplegar cualquier función de IA nueva o cambio de finalidad de una existente, completar el **AI Change Review** (§4). Ninguna función de IA llega a producción sin pasar el gate. **[BUENA PRÁCTICA / control M4]**

---

## 2. Roles y responsabilidades

| Rol | Responsable | Función |
|---|---|---|
| **Dueño de riesgo de IA** (AI Risk Owner) | **[[DECISION REQUIRED — designar persona/cargo]]** | Responsable último de la conformidad de la IA; aprueba nuevas funciones; mantiene el inventario y el registro de decisiones. |
| **Comité de IA** (AI Governance Committee) | Producto + Ingeniería + Legal/Privacidad + Trust & Safety | Revisa clasificación, DPIA, incidentes y cambios trimestralmente. |
| **DPO / Privacidad** | **[[DECISION REQUIRED — ¿se designa DPO?]]** (probable, `spain-eu.md` §4.5) | Vela por GDPR/leyes de datos LatAm; firma DPIA. |
| **Mantenedor técnico de IA** | Ingeniería backend/frontend | Opera `ai-agents`/`chatbot` y las Server Actions; aplica controles de seguridad. |
| **Enlace de proveedor (Google)** | Legal + Ingeniería | Gestiona el contrato/DPA con Google, condiciones de uso del modelo y cambios de versión. |

> **[INFERENCIA]** El comité puede ser ligero (mismas personas que ya existen) dado el tamaño pre-lanzamiento; lo importante es que **exista un dueño nombrado y un registro**, no una estructura pesada.

---

## 3. Registro de decisiones de IA (AI Decision Log)

Mantener un registro versionado (repositorio interno, fuera del código público) con una entrada por cada decisión material. Campos mínimos:

| Campo | Ejemplo |
|---|---|
| ID / fecha | `AID-2026-07-23-001` |
| Sistema afectado | A `ai-agents` |
| Decisión | "Se exige confirmación por código antes de `crearBorradorSolicitud`" |
| Motivo / norma | GDPR art. 22; Disp. AAIP 2/2023 |
| Clasificación de riesgo resultante | Riesgo limitado (art. 50) |
| Aprobado por | AI Risk Owner + DPO |
| Evidencia | PR #, DPIA vinculada |

**[OBLIGACIÓN, accountability AI Act / responsabilidad proactiva LatAm]** El registro es la prueba de gobernanza ante auditores/autoridades.

---

## 4. AI Change Review (gate de cambios)

Checklist obligatorio antes de desplegar/cambiar una función de IA:

1. ¿Cambia la **finalidad** o el **grado de automatización**? → reevaluar clasificación (AI Act, Colorado, etc.).
2. ¿La función **actúa** (escribe/modifica datos, ejecuta acciones)? → exige **confirmación humana por código** + logging.
3. ¿Envía **nuevos datos personales** al modelo? → actualizar mapa de datos, minimización y aviso.
4. ¿Genera **contenido publicado**? → marcado de IA (art. 50.2) + revisión editorial.
5. ¿Interactúa con personas? → aviso de interacción con IA (art. 50.1; Utah).
6. ¿Se probó **prompt injection, alucinación y sesgo**? → evidencia de pruebas (ver `ai-safety-security-and-misuse.md`).
7. ¿Está **versionado** el prompt y fijado el modelo? → registro de versión.
8. Aprobación del AI Risk Owner registrada en el AI Decision Log.

---

## 5. Alfabetización en IA del personal (art. 4 AI Act — YA EXIGIBLE)

> **[OBLIGACIÓN VIGENTE desde 2025-02-02]** (de `spain-eu.md` §5.4). Aplica a proveedores y **desplegadores**: garantizar un nivel suficiente de alfabetización en IA del personal que opere/use estos sistemas.

**Programa mínimo [BUENA PRÁCTICA ejecutable]:**
- Formación básica documentada para el equipo que mantiene `ai-agents`/`chatbot` y las Server Actions: qué es un desplegador, límites del modelo, alucinaciones, prompt injection, datos que no deben enviarse, obligaciones de transparencia.
- Registro de asistencia/fecha (evidencia de cumplimiento).
- Refresco anual y ante cambios materiales.
- Guía interna de "uso aceptable de IA" para empleados (qué se puede/no se puede pedir a la IA con datos de usuarios).

---

## 6. Cadencia de gobernanza

| Actividad | Frecuencia | Responsable |
|---|---|---|
| Revisión del inventario de IA | Trimestral + ante cada cambio | AI Risk Owner |
| Revisión de la clasificación de riesgo | Trimestral + ante cambio de finalidad | Comité de IA |
| Revisión de incidentes de IA | Continua + resumen trimestral | Trust & Safety |
| Verificación del contrato/versión de modelo con Google | Ante cambio de modelo/notificación de Google | Enlace de proveedor |
| Formación de alfabetización IA | Anual | People/Eng |
| Revisión de DPIA | Anual + ante cambio material | DPO |

---

## 7. Enlace con otros marcos

- Seguridad y abuso: `ai-safety-security-and-misuse.md`.
- Datos y modelo: `ai-data-and-model-governance.md`.
- Transparencia al usuario: `ai-user-transparency.md`.
- Incidentes: `ai-incident-response.md`.
- Contratos de proveedor (DPA Google): `../vendors-and-transfers/` (Fase 12) + `ai-implementation-checklist.md`.

---

## 8. Decisiones de negocio pendientes

- **[[DECISION REQUIRED]]** Persona/cargo del **AI Risk Owner**.
- **[[DECISION REQUIRED]]** Si se designa **DPO** (probable por perfil geo+analítica+IA).
- **[[DECISION REQUIRED]]** Nivel de supervisión humana exigido para el Sistema A (confirmación por código: sí/no y diseño de UX).
- **[[DECISION REQUIRED]]** Consolidación de los 3 SDKs y la gestión de la API key de Gemini en un único punto gobernado.
