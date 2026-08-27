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
  - [Plan de remediación legal del frontend](./tareaspendientes/plan-remediacion-legal-frontend.md)
  - [Matriz de decisiones — Fase 0 remediación legal](./tareaspendientes/matriz-decisiones-fase0-legal.md)
- [Expediente legal](./legal-research/README.md)
- [Activos de referencia](./assets/)

## Convenciones

- Usar nombres en `kebab-case` para carpetas y archivos, salvo `README.md`.
- Mantener documentos fuente de investigación en `research-raw/` dentro de su tema.
- No registrar secretos ni contraseñas en esta carpeta; documentar el procedimiento seguro para obtenerlos.
- Tras cambios estructurales, comprobar que los enlaces Markdown relativos sigan resolviendo.
