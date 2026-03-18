# CLAUDE.md ─ Reglas vivas del proyecto (actualizado por el equipo + Claude)

Última actualización: 2026-03-18
Tokens aproximados: ~1800–2200 (mantener < 3000 siempre)

## 0. Principios generales (siempre respetar)

- **Idioma**: SIEMPRE comunicarse en **español**. El código puede estar en inglés, la comunicación nunca.

- **Plan Mode primero** — Presenta un plan detallado y espera aprobación antes de implementar en estos casos:
  - Nuevo módulo o feature completo
  - Cambio de schema de Prisma
  - Nueva ruta o layout en el App Router
  - Cambio que afecte > 2 archivos no relacionados
  Termina siempre el plan con: "¿Apruebas este plan? ¿Qué cambiarías?"
  **Escape hatch**: Si el usuario incluye `"sin plan"` en su mensaje, implementa directamente.

- **Verificación obligatoria** — Después de cualquier cambio en `frontend/` o `backend/`:
  - Ejecuta `pnpm lint && pnpm build` en el área modificada
  - Nunca marques una tarea como terminada sin lint + build pasando
  - Si hay UI → describe visualmente el cambio o sugiere abrir el navegador
  - **Tests E2E (Playwright)**: El proyecto tiene setup completo en `frontend/tests/`. Ejecutar con `pnpm test:e2e` si los cambios afectan flujos cubiertos. Ver `TESTING-QUICK-START.md`.

- **Eficiencia** — Haz ÚNICAMENTE lo que se solicita. Sin extras, sin refactors no pedidos.

- **Subagentes cuando sea útil** — Usa subagentes para tareas paralelas (tests + implementación, frontend + backend, etc.)

- **Actualízame** — Si el usuario corrige un comportamiento repetido o inesperado, proponer al final un ajuste puntual al CLAUDE.md. No actualizar por cada corrección menor — solo cuando la regla sea reutilizable en futuras conversaciones.

## 1. Uso obligatorio de Agentes por área

- `frontend/` → Skill `nextjs-ddd-expert`: cualquier cambio en `frontend/`, server actions, componentes, layouts, rutas App Router
- `backend/` → Skill `nestjs-architect`: controllers, services, CQRS, módulos NestJS, Prisma, guards, DTOs
- Exploración amplia del codebase → `Agent` con `subagent_type=Explore`
- Búsquedas dirigidas → `Glob` o `Grep` directamente

Sin excepciones salvo búsquedas puntuales.

## 2. Protocolo de Control y Seguridad del Agente

- **Restricción de scope**: Frontend prohibido generar lógica de DB, controladores NestJS o esquemas Prisma. Backend prohibido generar JSX/TSX o estilos Tailwind.
- **Sin código aleatorio**: Cada línea debe tener un lugar en la arquitectura DDD (Domain, Application, Infrastructure, Presentation).
- **Análisis de impacto**: Advertir al usuario antes de cambios que afecten > 2 módulos de NestJS.
- **Scope quirúrgico**: Prohibido modificar archivos de configuración (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `biome.json`, etc.) salvo solicitud explícita.
- **No reescribas archivos completos**: Si el archivo tiene > 50 líneas, entrega solo el bloque modificado con indicación de dónde insertarlo.
- **DRY Enforcement**: Antes de escribir código, verificar si la lógica ya existe. Si existe, importarla.
- **Contract-First**: Si Frontend necesita un dato del Backend inexistente, generar primero la Interface TypeScript y solicitar implementación al Agente Backend.

## 3. Estructura del Monorepo

```
next-atlas-services/
├── frontend/           # Next.js 16.1 + React 19
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/   # Rutas públicas: buscar, login, perfil, publicar, registro, servicio, etc.
│   │   │   ├── (admin)/    # Panel de administración
│   │   │   └── api/
│   │   ├── features/       # Módulos DDD por dominio
│   │   ├── lib/
│   │   └── shared/
│   └── tests/              # Tests E2E con Playwright
├── backend/            # NestJS 10.4
│   └── src/
│       ├── modules/
│       ├── common/
│       └── prisma/
├── docker-database/    # PostgreSQL
├── .doc/               # Documentación y planes
├── package.json        # Scripts raíz (workspace)
└── pnpm-workspace.yaml
```

## 4. Gestión de Paquetes

**SIEMPRE usar `pnpm`**. Nunca npm ni yarn.

```bash
pnpm dev            # Backend + frontend en paralelo (concurrently)
pnpm dev:backend    # Solo NestJS
pnpm dev:frontend   # Solo Next.js

pnpm --filter frontend add <paquete>
pnpm --filter backend add <paquete>
```

## 5. Información del Proyecto

> **Nombre (Beta):** Atlas Service — MVP hiperlocal para la Isla de Chiloé (~35,000 hab.)
> Conecta usuarios con proveedores de servicios manuales (electricistas, carpinteros, gásfiter, fletes, mudanzas).
> **URL de producción:** No definida. El proyecto NO está desplegado.

Ver `README.md` para la visión completa, estructura de DB y funcionalidades planificadas.

## 6. Configuración Técnica (Frontend)

- **Next.js 16.1**, React 19, React Compiler habilitado (`reactCompiler: true`)
- **TypeScript** strict mode, ES2017 target, JSX: `react-jsx`
- **Tailwind CSS v4** con PostCSS
- **Biome** para linting (no ESLint), **Prettier** para formateo
- **Prisma ORM v7** + PostgreSQL
- Path alias: `@/*` → `./src/*`
- Complejidad cognitiva máxima: 15
- Prettier: print width 100, tab 4 espacios, single quotes, trailing commas
- Import order: React → node: → npm → @scoped → @/ → ./

### Comandos de base de datos

```bash
pnpm db:generate   # Genera cliente Prisma
pnpm db:migrate    # Crea y ejecuta migraciones
pnpm db:studio     # GUI de Prisma
```

**Regla Prisma**: Nunca usar `prisma db push` en desarrollo ni producción. Siempre migraciones versionadas (`db:migrate`).

## 7. Guías de Desarrollo

- **Server Components por defecto**; `'use client'` solo cuando haya interactividad real
- **Server Actions** para mutaciones; no crear API routes separadas
- **Imágenes**: siempre `next/image`
- **Validación**: Zod en Server Actions
- **Auth.js**: Email/Password + Google OAuth; rutas protegidas: `/publicar`, `/perfil`
- **React Compiler** habilitado — evitar memoización manual salvo que el profiling lo indique

### Diseño y UX

- Mobile-first
- Paleta: fondo `bg-white`, cards `bg-gray-50`, accent `bg-blue-500`, éxito `bg-green-500`
- Componentes UI: shadcn/ui para botones, modales, forms
- Iconos: React Icons
- Español chileno: "gásfiter" (no "plomero"), comunas de Chiloé en filtros

## 8. Errores ya corregidos (no repetir)

<!-- Se llena cuando Claude comete un error repetido. Pedir agregar la regla aquí. -->

- (vacío por ahora)
