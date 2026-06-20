# Asignación de Tareas — ⚠️ DEPRECADO (2026-06-20)

> Este documento se **consolidó** para tener una sola fuente de verdad.
> No editar acá. Usar:
>
> - **Ejecución y QA por fase:** [`plan-remediacion-2026-06.md`](./plan-remediacion-2026-06.md) — checklists, commits y gates GO/NO-GO.
> - **Inventario y checklist de deuda:** [`deuda-tecnica.md`](./deuda-tecnica.md) — todos los DT con su estado.

---

## Guía rápida de delegación (referencia)

Criterio de quién ejecuta cada tipo de tarea (la asignación concreta vive en el plan):

| Perfil | Tipo de tarea | Ejemplos |
|--------|---------------|----------|
| **🤖 Agente ejecutor** (Antigravity / opencode / Gemini) | Acotada, mecánica, verificable con build/lint | Tipar `any`, limpiar deps huérfandas, mover componentes, i18n |
| **👀 Claude Code (QA/Gate)** | Verificación independiente al cierre de cada fase; review de seguridad | Gates GO/NO-GO del plan, `/cso` de auth/pagos |
| **🧑 Humano** | Credenciales, settings de dashboard, decisiones de producto | Rotar PAT, CORS/Node en Vercel, purga de historial git, Escrow real |

> El detalle por tarea (con archivos y criterio de aceptación) que antes estaba aquí
> quedó integrado en las fases del plan de remediación.
