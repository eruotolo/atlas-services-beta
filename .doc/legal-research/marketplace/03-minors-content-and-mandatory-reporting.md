# Explotación de menores en contenido/mensajería: reporte obligatorio y DSA por tamaño (Fase 10)

**Última actualización:** 2026-07-23
**Fuente base:** investigación de fuentes primarias por agente Haiku 4.5 (`marketplace/haiku-research-fase10-raw.md`), con verificación de la afirmación más inestable por Sonnet 5 (§2).
**Estado:** 🟡 borrador — situación normativa de la UE en este tema es **inusualmente inestable a la fecha de este informe**; requiere monitoreo activo, no solo revisión puntual.

## 1. Reporte obligatorio de CSAM (contenido de abuso sexual infantil) — por jurisdicción

| Jurisdicción | ¿Existe obligación legal de reportar CSAM detectado a una autoridad? | A quién | Plazo | Base |
|---|---|---|---|---|
| Estados Unidos | **Sí** — obligación federal | NCMEC (National Center for Missing & Exploited Children) | "Tan pronto como sea razonablemente posible" tras tomar conocimiento real — sin plazo máximo numérico en la norma | 18 U.S.C. § 2258A, ampliada por la REPORT Act (2024). Aplica a "proveedores de servicios de comunicación electrónica y de computación remota" — una plataforma con mensajería como Hireeo encajaría en esta definición si opera en EE.UU. |
| España / UE | **Sin obligación legal permanente y uniforme a la fecha de este informe** — ver §2, situación inestable | — | — | No existe todavía un Reglamento CSAM permanente de la UE (en negociación desde 2022, sin aprobar). El marco temporal que permitía la **detección voluntaria** (no obligatoria) en comunicaciones privadas expiró el 2026-04-03 sin reemplazo confirmado a la fecha de este informe |
| Uruguay | **No existe obligación específica** para plataformas de reportar CSAM a una autoridad administrativa. Ley 17.815 (2004) sanciona la explotación sexual infantil, pero no impone un deber de reporte proactivo a la plataforma — solo el deber general de colaborar con la justicia | — | — | Ley 17.815 |
| Argentina | **No se identificó una obligación federal específica** de reporte de CSAM por plataformas en esta investigación | — | — | Pendiente de verificación adicional — no se debe asumir ausencia total de obligación sin una búsqueda más profunda si esto se vuelve materialmente relevante |
| Chile | **No se identificó una obligación específica** de reporte de CSAM por plataformas en esta investigación | — | — | Igual advertencia que Argentina |

## 2. Situación en la UE — verificación y advertencia de inestabilidad

**Lo que se verificó de forma independiente (Sonnet 5):** el marco temporal de excepción a la Directiva ePrivacy que permitía a los proveedores de comunicaciones detectar voluntariamente CSAM en comunicaciones privadas **expiró el 3 de abril de 2026**, tras el fracaso de las negociaciones para extenderlo. A la fecha de este informe (23 de julio de 2026), **no hay un reemplazo permanente confirmado y vigente** — el "Reglamento CSAM" permanente sigue en negociación (trílogo Parlamento-Consejo-Comisión) desde 2022.

**Advertencia de calidad — fuentes contradictorias sobre el proceso político:** las fuentes consultadas dan cifras de votación distintas y aparentemente contradictorias sobre si el Parlamento Europeo apoyó o rechazó una extensión (una fuente cita una votación de apoyo a una extensión hasta agosto de 2027; otra confirma que las negociaciones del trílogo fracasaron y la excepción expiró igualmente el 3 de abril de 2026). **No se puede citar con precisión el resultado político exacto sin verificación adicional** — pero el hecho operativo relevante para Hireeo (que la base legal para la detección voluntaria de CSAM en comunicaciones privadas está hoy vencida en la UE) se considera confirmado con razonable confianza porque coincide en las fuentes que sí distinguen claramente la fecha de vencimiento (3 de abril de 2026).

## 3. Implicación directa para Hireeo (inferencia, no hecho normativo)

- Hireeo tiene mensajería entre clientes y prestadores (`Conversation`, ya identificado como H1 en `marketplace/01`). Si esa mensajería llegara a usarse para explotación de menores:
  - En **EE.UU.**, Hireeo tendría el deber legal de reportarlo a NCMEC tan pronto como tenga conocimiento real — esto aplica independientemente del tamaño de la plataforma.
  - En **la UE**, no hay hoy una obligación legal permanente de reporte proactivo específica para plataformas como Hireeo, pero el deber general de cooperar con las autoridades y de retirar contenido ilícito manifiesto (ya citado en `marketplace/01` §5) sigue vigente.
  - En **Uruguay, Argentina y Chile**, aplica el deber general de colaborar con la justicia una vez detectado, sin un canal de reporte administrativo específico identificado.
- **No se debe implementar escaneo proactivo de mensajes privados en la UE** asumiendo que existe base legal para ello — la base legal temporal que lo permitía expiró. Esto es relevante solo si Hireeo llegara a considerar herramientas de detección automática de contenido en mensajería.

## 4. DSA — aplicabilidad según tamaño (confirma y detalla lo ya anticipado en `marketplace/02-trust-and-safety-program.md` §4)

| Categoría de obligación DSA | ¿Aplica a Hireeo hoy (plataforma pequeña, no VLOP)? |
|---|---|
| Punto de contacto único (arts. 11-12) | **Sí** — aplica a todos los proveedores, sin importar tamaño |
| Transparencia y motivación de retirada de contenido (arts. 16-17) | **Sí** — ya confirmado en `marketplace/01` §5 |
| Transparencia de moderación y publicidad (arts. 20-21) | **Sí** |
| Trusted Flaggers — priorizar sus reportes (art. 22) | **Sí** — aplica a cualquier tamaño; de hecho, es más útil para una plataforma pequeña con recursos limitados de moderación |
| Evaluación de riesgos sistémicos y auditoría externa (arts. 33-43) | **No** — reservado a Very Large Online Platforms (VLOP), umbral de **45 millones de usuarios activos mensuales en la UE** (~10% de la población de la UE). Hireeo está muy por debajo de ese umbral |

**Hecho confirmado:** el umbral de VLOP (45 millones de usuarios activos mensuales en la UE) es un dato estable del DSA, no sujeto a la inestabilidad política de §2 — se usa con confianza alta.

## 5. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| CSAM-Q1 | Verificar con mayor profundidad si Argentina y Chile tienen alguna obligación sectorial de reporte de CSAM antes de asumir su ausencia total | `MEDIUM` |
| CSAM-Q2 | Monitorear el estado del Reglamento CSAM permanente de la UE — este documento debe revisarse cuando haya una resolución (aprobación, nueva prórroga o rechazo definitivo) | `HIGH` — situación activa a la fecha de este informe |
| CSAM-Q3 | Definir el canal de reporte de contenido ilícito en mensajería (relacionado con `TS-Q2` de `02-trust-and-safety-program.md`) | `MEDIUM` |

## 6. Revisión por abogado local pendiente

La obligación de EE.UU. (18 U.S.C. § 2258A) tiene alta confianza. La situación de la UE (§2) es correcta en su hecho operativo central (vencimiento de la excepción temporal el 2026-04-03) pero **inusualmente volátil** — debe confirmarse el estado más reciente con un abogado de la UE antes de tomar cualquier decisión de producto relacionada con detección de contenido en mensajería.
