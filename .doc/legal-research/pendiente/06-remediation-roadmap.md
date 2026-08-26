# Hoja de ruta de remediación (Fase 15)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador. Prioriza acciones en 0-14 días, 15-45 días, 46-90 días, pre-lanzamiento y continuidad trimestral, según el formato exigido por `prompt.md` Fase 15. Los bloqueadores de lanzamiento están marcados explícitamente.

## 0-14 días — decisiones que desbloquean todo lo demás

| Acción | Criterio de aceptación | Responsable sugerido | Dependencias | Esfuerzo | ¿Bloquea lanzamiento? |
|---|---|---|---|---|---|
| Confirmar/constituir la entidad legal operadora (razón social, país, domicilio, representante) | Documento de constitución disponible; footer y Términos alineados con la entidad real | Founders / Legal | — | Medio | **SÍ** |
| Corregir la contradicción "no somos intermediarios / sin comisiones" vs. el escrow del 15% modelado en código | Texto público consistente con el modelo de negocio real elegido | Legal / Product | Decisión de Escenario A/B | Bajo | **SÍ** |
| Decidir el Escenario de pagos (A: solo conecta, o B: escrow con comisión) y el PSP/merchant of record | Decisión documentada y comunicada a Legal/Finance/Engineering | Founders / Finance | — | Medio | **SÍ** |
| Definir el rol de tratamiento de datos de Hireeo (responsable/encargado) por cada actividad (Q3) | Tabla de roles confirmada, no hipotética | Legal | Depende de la entidad (arriba) | Bajo-Medio | **SÍ** |
| Asignar un responsable de triage de incidentes de seguridad (IR-Q1) | Persona/rol nombrado y comunicado al equipo | Security / Founders | — | Bajo | **SÍ** |
| Confirmar región/proveedor de PostgreSQL, backups y Cloudinary (Q5) | Documento interno con región confirmada por servicio | Engineering | — | Bajo | **SÍ** |

## 15-45 días — cierre de brechas técnicas y contractuales

| Acción | Criterio de aceptación | Responsable sugerido | Dependencias | Esfuerzo | ¿Bloquea lanzamiento? |
|---|---|---|---|---|---|
| Implementar barrera de edad / verificación proporcional para menores | Registro rechaza o deriva correctamente a menores declarados | Product / Engineering | — | Medio | **SÍ** |
| Implementar CMP con bloqueo previo de GTM/GA4 hasta consentimiento | Auditoría confirma que ningún script no esencial carga antes de consentimiento | Engineering | — | Medio | Sí, para España/UE |
| Confirmar contrato/DPA con Google (tier pago/gratuito de Gemini, entrenamiento, región) | DPA firmado o confirmación escrita del proveedor | Legal / Engineering | — | Medio | **SÍ** |
| Confirmar existencia de DPA/SCC con Stripe, MercadoPago, Cloudinary, Brevo, Firebase | Lista de contratos firmados vs. pendientes | Legal / Finance | — | Medio | Sí, antes de procesar datos reales |
| Implementar canal operativo de solicitudes de derechos de titulares | Canal visible + SLA interno de 5 días hábiles documentado | Product / Engineering / Legal | Entidad legal confirmada | Medio | **SÍ** |
| Activar KYC real de prestadores (salir de stub) | Verificación de identidad funcional en producción | Engineering | — | Alto | Sí, antes de categorías de riesgo |
| Diseñar y publicar la matriz de categorías de servicio (prohibido/regulado/sensible/general) | Catálogo real de categorías validado por Producto | Product / Trust & Safety | — | Medio | Sí, antes de habilitar oficios regulados |

## 46-90 días — programas y políticas

| Acción | Criterio de aceptación | Responsable sugerido | Dependencias | Esfuerzo | ¿Bloquea lanzamiento? |
|---|---|---|---|---|---|
| Implementar verificación de licencia/matrícula contra registros oficiales en oficios regulados | Verificación activa funcionando para al menos electricidad y gas | Trust & Safety / Engineering | Matriz de categorías | Alto | Sí, para esas categorías |
| Implementar canal de notice-and-action (reporte, motivación, apelación) | Canal operativo con registro de decisiones | Trust & Safety / Product | — | Medio-Alto | Recomendado, obligatorio en UE |
| Diseñar y confirmar política de no-show/reprogramación | Política publicada y flujo de evidencia de servicio ejecutado | Product / Trust & Safety | — | Medio | No, pero reduce disputas |
| Confirmar región/configuración real de backups y probar restauración | Prueba de restauración documentada | Engineering | — | Medio | Recomendado |
| Definir canal de reporte de fraude | Canal visible para clientes y prestadores | Trust & Safety | — | Bajo-Medio | Recomendado |
| Publicar la matriz de contratos corporativos y comenzar a firmar cesiones de IP | Al menos cesiones de fundadores firmadas | Legal | Entidad confirmada | Medio | Recomendado, alto valor |

## Pre-lanzamiento (antes de cobrar por primera vez o de operar pagos reales)

| Acción | Criterio de aceptación | Responsable sugerido | Dependencias | Esfuerzo | ¿Bloquea lanzamiento? |
|---|---|---|---|---|---|
| Confirmar licencia/registro financiero necesario en cada país según el Escenario de pago elegido | Dictamen local por país confirmando si se necesita licencia | Legal (local por país) | Escenario de pago | Alto | **SÍ**, antes de cobrar |
| Diseñar recolección de NIF/domicilio fiscal de prestadores en la UE (DAC7, sin umbral de exención) | Flujo de recolección implementado antes de la primera transacción en la UE | Finance / Engineering | Escenario de pago en UE | Medio | **SÍ**, para España/UE |
| Confirmar registro AML ante BCRA/UIF (Argentina) o CMF/UAF (Chile) si se retienen fondos | Registro completado o confirmación de que no aplica | Legal / Finance | Escenario B | Alto | **SÍ**, si aplica Escenario B |
| Publicar el paquete completo de `legal-documents/` tras revisión de abogado local en cada país | Documentos revisados y aprobados, sin `[[DECISION REQUIRED]]` pendientes | Legal (equipo + abogados locales) | Todo lo anterior | Alto | **SÍ** |

## Continuidad trimestral

| Acción | Criterio de aceptación | Responsable sugerido | Frecuencia |
|---|---|---|---|
| Monitorear el estado del Reglamento CSAM permanente de la UE | Registro actualizado de si se aprobó, prorrogó o rechazó | Legal | Trimestral |
| Monitorear la transposición de la Directiva (UE) 2024/2831 de trabajo en plataformas por los Estados miembros relevantes | Registro actualizado antes del plazo de 2026-12-02 | Legal | Trimestral |
| Revisar el volumen de usuarios por país de EE.UU. contra los umbrales de leyes estatales de privacidad | Tabla de umbrales vs. volumen real actualizada | Legal / Data | Trimestral |
| Revisar el estado de Proposition 22 (California) — información contradictoria a la fecha de este informe | Confirmación con fuente primaria del estado judicial vigente | Legal | Trimestral hasta resolverse |
| Auditoría de coherencia entre `legal-documents/` y el comportamiento real del producto | Sin nuevas contradicciones detectadas | Legal / Product | Trimestral |

## Bloqueadores de lanzamiento — lista consolidada

Estas siete condiciones son las que, de no resolverse, impiden razonablemente publicar el paquete legal completo o comenzar a cobrar:

1. Entidad legal operadora confirmada y consistente con toda la documentación pública.
2. Contradicción "no intermediarios/sin comisiones" vs. escrow del 15% corregida.
3. Escenario de pago (A/B) y PSP/MoR definidos.
4. Rol de tratamiento de datos (Q3) confirmado.
5. Contrato/DPA con Google (Gemini) confirmado.
6. Canal operativo de derechos de titulares implementado.
7. Barrera de edad implementada.
