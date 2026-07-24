# Resumen ejecutivo (para fundadores)

**Última actualización:** 2026-07-23
**No es asesoría legal.** Este resumen sintetiza un expediente de investigación técnico-jurídica; requiere revisión de abogado habilitado en cada jurisdicción antes de tomar decisiones basadas en él.

## Perfil de producto confirmado

Hireeo es un marketplace multi-país de servicios manuales/profesionales (Uruguay, Argentina, Chile, España, Estados Unidos) que hoy conecta clientes con prestadores mediante perfiles, búsqueda, mensajería, reseñas y un asistente de IA con capacidad de crear solicitudes de servicio. **Los pagos y el escrow (comisión 15%) están en estado *stub/mock* — no hay flujo de fondos real hoy.** El KYC de prestadores también está en *stub*. No existe entidad legal confirmada en el código ni en la documentación del proyecto.

## Los 10 riesgos principales

1. **Contradicción activa** entre el mensaje público ("no somos intermediarios, sin comisiones") y el modelo de negocio real (escrow con 15% de comisión) — es una inconsistencia verificable hoy, no un riesgo futuro.
2. **Ausencia de entidad legal confirmada** — bloquea la publicación de cualquier Término de Servicio, Política de Privacidad o factura.
3. **Modelo de pago indefinido** (Escenario A "solo conecta" vs. B "escrow real") — condiciona licencias financieras, AML, PCI e impuestos en las 5 jurisdicciones.
4. **Sin canal operativo para solicitudes de derechos de titulares** — expone a incumplimiento inmediato en cuanto llegue la primera solicitud real (plazo más exigente: 5 días hábiles en Uruguay/Argentina).
5. **Sin barrera de edad para menores** — riesgo transversal bajo COPPA (EE.UU.) y LOPDGDD (España).
6. **Contrato con Google (Gemini) no confirmado** — no se sabe si el input de los usuarios entrena los modelos de Google fuera de la UE/EEE, ni la región de procesamiento.
7. **Tracking sin consentimiento previo** (GTM/GA4 cargan antes de que el usuario acepte) — infracción directa en España/UE.
8. **DAC7 en la Unión Europea no tiene umbral de exención para servicios** (a diferencia de bienes) — si se activan pagos reales en la UE, prácticamente todos los prestadores deberán reportarse a Hacienda, no solo los de alto volumen.
9. **Sin verificación de licencias/matrículas** en oficios regulados (electricidad, gas, construcción, transporte) — expone a responsabilidad por facilitación de servicios no licenciados.
10. **Cláusula de resolución de disputas no puede ser única para las 5 jurisdicciones** — arbitraje obligatorio + renuncia a acción de clase es válido en EE.UU. pero inválido en Uruguay, Argentina, Chile y España/UE.

## Bloqueadores de lanzamiento (7, ver `06-remediation-roadmap.md`)

1. Entidad legal operadora confirmada.
2. Contradicción "sin comisiones" vs. escrow corregida.
3. Escenario de pago y PSP/MoR definidos.
4. Rol de tratamiento de datos confirmado.
5. Contrato/DPA con Google confirmado.
6. Canal de derechos de titulares implementado.
7. Barrera de edad implementada.

## Exposición por país (síntesis)

| País | Exposición dominante | Bloqueador específico |
|---|---|---|
| Uruguay | Plazo de derechos más corto de las 5 jurisdicciones (5 días hábiles); régimen de renovación automática ya reformado (2024) | Entidad/domicilio no confirmados |
| Argentina | Responsabilidad solidaria de marketplace si se retienen fondos (art. 40 LDC); AML reforzado desde 2024 (Ley 27.739) | Modelo de MoR no definido |
| Chile | Responsabilidad directa del intermediario ante el consumidor (Ley 19.496 art. 43); Ley 21.719 (privacidad) entra en vigor 2026-12-01 | Verificación de licencias en oficios regulados |
| España/UE | Mayor densidad regulatoria (GDPR, DSA, AI Act, DAC7, EAA); DAC7 sin exención para servicios es el hallazgo más material de esta auditoría | Tracking sin consentimiento; contrato con Google |
| Estados Unidos | Fragmentación por estado; arbitraje/class-action-waiver es la única jurisdicción donde esa cláusula es válida | Confirmar umbrales estatales antes de asumir aplicabilidad |

## Decisiones requeridas de los fundadores (no de Legal)

- ¿Qué entidad legal operará Hireeo, en qué país, y con qué domicilio?
- ¿Escenario A (solo conecta) o B (escrow con comisión) para el modelo de pago?
- ¿Se corrige ya el mensaje público de "sin comisiones" o se espera a la decisión de pago?
- ¿Existe alguna política interna (no reflejada en el código) que exija exclusividad u horario a los prestadores? (determina el riesgo de reclasificación laboral)
- ¿Qué categorías de servicio se habilitarán realmente? (determina qué verificación de licencias se necesita)

## Costos/esfuerzo estimado de mitigación (cualitativo)

- **Bajo esfuerzo, alto impacto:** corregir el mensaje "sin comisiones"; asignar responsable de triage de incidentes; confirmar región de infraestructura.
- **Medio esfuerzo:** implementar CMP de cookies; canal de derechos de titulares; barrera de edad.
- **Alto esfuerzo:** activar KYC real; verificación de licencias contra registros oficiales; definir y contratar el modelo de pago con PSP/MoR y las licencias asociadas.

## Próximos pasos (5, priorizados)

1. Resolver los 7 bloqueadores de lanzamiento listados arriba — son la condición para que el resto del expediente sea operativo, no solo teórico.
2. Contratar revisión de abogado local en las 5 jurisdicciones sobre el paquete de `legal-documents/` (18 documentos, ya en borrador).
3. Confirmar el contrato con Google (Gemini) antes de procesar más datos personales reales vía IA.
4. Diseñar la recolección de datos fiscales de prestadores en la UE antes de activar pagos reales ahí (DAC7).
5. Establecer el ciclo de monitoreo trimestral ya definido en `06-remediation-roadmap.md` (Directiva UE de trabajo en plataformas, Reglamento CSAM, umbrales estatales de EE.UU., estado de Proposition 22).

## Supuestos críticos pendientes de aprobación

Los 7 bloqueadores de arriba, más: el estado de vigencia de Proposition 22 en California (fuentes contradictorias, no resuelto en esta auditoría); y la verificación puntual pendiente de varias citas legislativas muy recientes (Ley 10/2025 España, AB 2863 California, Disposición 377/2026 Argentina) antes de usarlas en cualquier documento publicado.

## Dónde está todo

Ver `README.md` para el índice completo y el estado de cada entregable. Ver `appendices/quality-control-report.md` para el detalle de errores encontrados y corregidos durante esta auditoría.
