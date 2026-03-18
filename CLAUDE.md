# CLAUDE.md ─ Reglas vivas del proyecto (actualizado por el equipo + Claude)

Última actualización: 2026-03-17
Tokens aproximados: ~1800–2200 (mantener < 3000 siempre)

## 0. Principios generales (siempre respetar)

- **Plan Mode primero** — Toda tarea > 30 minutos empieza con un plan detallado escrito.
  Nunca implementes nada sin que yo apruebe explícitamente el plan.
  Termina siempre el plan con: "¿Apruebas este plan? ¿Qué cambiarías?"

- **Verificación obligatoria** — Después de cualquier cambio significativo:
  - Ejecuta tests (frontend + backend)
  - Corre lint + type-check
  - Si hay UI → describe visualmente el cambio o sugiere abrir el navegador
  - Nunca marques una tarea como terminada sin pruebas pasando o evidencia clara

- **Subagentes cuando sea útil** — Usa `use subagents` para tareas paralelas (tests + implementación, frontend + backend, etc.)

- **Actualízame** — Después de cualquier corrección importante, termina con:
  > Update your CLAUDE.md so you don't make that mistake again.
