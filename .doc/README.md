# Documentación interna — Hireeo

Este directorio reúne documentación operativa y de producto del repositorio. Cada documento nuevo, eliminado o movido debe reflejarse en este índice y, cuando aplique, en el índice de su área.

## Índice

- [Arquitectura](./arquitectura/)
  - [Repositorios y despliegue](./arquitectura/arquitectura-repos-deploy.md)
  - [Flujos del producto](./arquitectura/flujos-hireeo.md)
  - [Roles y funciones](./arquitectura/roles-y-funciones.md)
- [Contenido del producto](./contenido/)
  - [Descripción del proyecto](./contenido/proyecto-hireeo.md)
  - [Comparativa web y móvil](./contenido/appmobile-claude.md)
- [Infraestructura](./infra/)
  - [Variables de entorno y rotación](./infra/infra-env-vars-y-rotacion.md)
  - [Guía de cuentas de desarrollo](./infra/credenciales-desarrollo.md)
  - [Vercel multicuenta](./infra/vercel-multicuenta.md)
- [Testing QA](./testingqa/)
  - [Índice E2E por rol y país](./testingqa/README.md)
  - [Público](./testingqa/plan-e2e-publico.md)
  - [Client](./testingqa/plan-e2e-client.md)
  - [Professional](./testingqa/plan-e2e-professional.md)
  - [Admin](./testingqa/plan-e2e-admin.md)
  - [SuperAdmin](./testingqa/plan-e2e-superadmin.md)
  - [Publicación multipaís](./testingqa/plan-e2e-publicacion-multipais.md)
- [Tareas pendientes](./tareaspendientes/)
  - [Incidencias E2E Público](./tareaspendientes/e2e-publico-incidencias.md)
  - [Incidencias E2E Client](./tareaspendientes/e2e-client-incidencias.md)
  - [Incidencias E2E Professional](./tareaspendientes/e2e-professional-incidencias.md)
  - [Incidencias E2E Publicación Multipaís](./tareaspendientes/e2e-publicacion-multipais-incidencias.md)
  - [Incidencias E2E Admin](./tareaspendientes/e2e-admin-incidencias.md)
  - [Incidencias E2E SuperAdmin](./tareaspendientes/e2e-superadmin-incidencias.md)
  - [Plan canónico de remediación E2E](./tareaspendientes/grok-e2e-incidencias.md)
  - [Super plan Opus (fuente)](./tareaspendientes/opus-e2e-incidencias.md)
  - [Superplan SOL (fuente)](./tareaspendientes/sol-e2e-incidencias.md)
- [Activos de referencia](./assets/)

## Credenciales de prueba E2E (solo entorno local)

> Cuentas seedadas en la base local (`docker-database`, puerto `5435`) para ejecutar
> [testingqa/plan-e2e-publico.md](./testingqa/plan-e2e-publico.md) y planes relacionados.
> Password reseteado el 2026-08-27 para las 28 cuentas de prueba, misma contraseña para todas:
>
> **Password:** `Hireeo2026!Test`

| País | Admin | Client | Professional |
| --- | --- | --- | --- |
| Chile (`cl`) | `admin.cl@hireeo.app` | `client1.cl@hireeo.app`, `client2.cl@hireeo.app` | `pro1.cl@hireeo.app`, `pro2.cl@hireeo.app` |
| Argentina (`ar`) | `admin.ar@hireeo.app` | `client1.ar@hireeo.app`, `client2.ar@hireeo.app` | `pro1.ar@hireeo.app`, `pro2.ar@hireeo.app` |
| Uruguay (`uy`) | `admin.uy@hireeo.app` | `client1.uy@hireeo.app`, `client2.uy@hireeo.app` | `pro1.uy@hireeo.app`, `pro2.uy@hireeo.app` |
| España (`es`) | `admin.es@hireeo.app` | `client1.es@hireeo.app`, `client2.es@hireeo.app` | `pro1.es@hireeo.app`, `pro2.es@hireeo.app` |
| Estados Unidos (`us`) | `admin.us@hireeo.app` | `client1.us@hireeo.app`, `client2.us@hireeo.app` | `pro1.us@hireeo.app`, `pro2.us@hireeo.app` |

SuperAdmin (global, no scoped a país): `edgardoruotolo@gmail.com`, `nluis@outlook.com`, `luisnuy@gmail.com` — misma contraseña de arriba.

## Convenciones

- Usar nombres en `kebab-case` para carpetas y archivos, salvo `README.md`.
- Mantener documentos fuente de investigación en `research-raw/` dentro de su tema.
- No registrar secretos ni contraseñas reales/producción en esta carpeta; documentar el procedimiento seguro para obtenerlos. Excepción explícita: credenciales de cuentas de prueba E2E en base local (sección arriba), a pedido expreso del propietario del proyecto.
- Tras cambios estructurales, comprobar que los enlaces Markdown relativos sigan resolviendo.
