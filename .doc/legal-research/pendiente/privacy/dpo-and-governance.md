# DPO, representante legal y gobierno de privacidad (Fase 4.8)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador normativo.

## 1. Umbral o criterio de designación por jurisdicción

| Jurisdicción | ¿Obligatorio? | Criterio/umbral | Calificaciones exigidas |
|---|---|---|---|
| España / UE (GDPR art. 37) | Depende del rol, no de una empresa por defecto | (a) autoridad pública — sin umbral, obligación incondicional; (b) monitoreo sistemático y a gran escala de personas como actividad principal; (c) tratamiento a gran escala de categorías especiales de datos como actividad principal. GDPR **no define "gran escala" con una cifra** — EDPB evalúa número de sujetos, alcance geográfico, volumen, duración y sensibilidad | Conocimiento experto en Derecho de protección de datos; sin certificación obligatoria; independencia garantizada por ley |
| Uruguay (Decreto 64/2020) | Sí, en dos supuestos | Organismos **públicos**: siempre. Organismos **privados**: si (1) el tratamiento de datos sensibles es actividad principal, o (2) el volumen supera **35.000 personas** | Conocimiento de la ley y especialización en protección de datos; **acreditación obligatoria ante la URCDP** — régimen más estricto que el GDPR. Designación debe ser **aprobada** (no solo notificada) por la URCDP dentro de 90 días desde el inicio del tratamiento |
| Argentina | No hay obligación general vigente | Resolución AAIP 40/2018 estableció un modelo de política de protección de datos para organismos públicos; a octubre de 2024 ningún organismo público había designado DPO formalmente — el primer DPO oficial fue el de AFIP (Provisión 173/2024, oct. 2024). Hay proyectos de reforma en curso (2026) para hacer el DPO obligatorio, con fecha y criterios aún **por definir** | No aplica todavía a privados |
| Chile (Ley 21.719, entra en vigor 2026-12-01 — hoy no vigente) | Sí, desde la entrada en vigor | Organizaciones públicas y privadas que trate datos personales "de forma significativa" — **sin umbral numérico en la ley**; los reglamentos de desarrollo (pendientes de publicación) deben fijar el criterio exacto | Por definir en reglamento |

## 2. Implicación directa para Hireeo (inferencia, no hecho confirmado)

- Hireeo **no está obligado hoy** a designar DPO en Argentina ni en Chile (la ley chilena aún no rige).
- Si Hireeo alcanza **más de 35.000 usuarios en Uruguay**, o trata datos sensibles como actividad principal en Uruguay, activa la obligación de designar y acreditar un DPO ante la URCDP — **este umbral debe monitorearse activamente**, no es un ejercicio único.
- En España/UE, la obligación depende de si Hireeo hace "monitoreo sistemático a gran escala" de usuarios — esto podría activarse por funciones de perfilado, ranking algorítmico o recomendaciones con IA si operan sobre un volumen suficiente. **Requiere análisis de producto, no solo de volumen de usuarios** (ver `ai/ai-classification-and-risk-assessment.md`).

## 3. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| DPO-Q1 | ¿Cuántos usuarios activos tiene o proyecta Hireeo en Uruguay a 12 meses? (umbral relevante: 35.000) | `HIGH` |
| DPO-Q2 | ¿Las funciones de ranking/recomendación con IA de Hireeo constituyen "monitoreo sistemático a gran escala" bajo criterios EDPB? Requiere análisis conjunto con Fase 6 (IA) | `HIGH` |
| DPO-Q3 | ¿Quién asumiría internamente el rol de DPO o responsable de privacidad si se activa la obligación? | `MEDIUM` |

## 4. Gobierno de privacidad — elementos mínimos recomendados (no obligación legal automática)

Esto es una **recomendación de buena práctica**, no una obligación derivada directamente de una norma citada arriba, salvo que se active alguno de los umbrales de §1:

- Registro de Actividades de Tratamiento (ROPA) actualizado — ya iniciado en `privacy/data-inventory-and-ropa-draft.md`.
- Punto único de contacto interno para consultas de privacidad (puede no ser un DPO formal si no se activa la obligación).
- Revisión periódica de este documento cuando cambie el volumen de usuarios por país o se lance una nueva función de IA con impacto en perfilado.

## 5. Fuentes primarias

| ID | Fuente | Órgano emisor | URL | Fecha | Fecha de acceso |
|---|---|---|---|---|---|
| DPO-EU-01 | GDPR art. 37 | Parlamento Europeo y Consejo | https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | 2016-05-04 | 2026-07-23 |
| DPO-UY-01 | Decreto 64/2020 | Poder Ejecutivo de Uruguay | https://resourcehub.bakermckenzie.com/en/resources/global-data-cyber-handbook/latin-america/uruguay/topics/dpos-and-notification-requirements | 2020-02-21 | 2026-07-23 — **fuente secundaria (Baker McKenzie); pendiente verificar contra IMPO/texto oficial del decreto** |
| DPO-AR-01 | Resolución AAIP 40/2018 y Provisión AFIP 173/2024 | AAIP / AFIP | https://www.argentina.gob.ar/aaip/datospersonales | 2018 / 2024-10-04 | 2026-07-23 |
| DPO-CL-01 | Ley 21.719 | Diario Oficial de Chile | https://www.diariooficial.interior.gob.cl/edicionelectronica/index.php?date=13-12-2024&edition=44023 | 2024-12-13 | 2026-07-23 |

**Nota de calidad:** DPO-UY-01 no se verificó contra el texto oficial del decreto en IMPO (Uruguay) sino contra una guía de un estudio jurídico internacional. Debe confirmarse contra fuente primaria (impo.com.uy) antes de que este documento se use para fundar una decisión operativa.

## 6. Revisión por abogado local pendiente

La calificación de "actividad principal" y "gran escala" bajo GDPR (§1, fila España/UE) requiere criterio jurídico caso por caso — no es determinable solo con datos técnicos. Requiere abogado habilitado en la UE antes de concluir si Hireeo necesita o no un DPO formal.
