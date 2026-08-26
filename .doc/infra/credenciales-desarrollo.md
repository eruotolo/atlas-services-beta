# Credenciales de desarrollo

> **Solo entorno local de desarrollo.** No registrar contraseñas, tokens ni
> secretos en el repositorio. Obtener los valores de prueba desde el gestor de
> secretos aprobado o mediante el proceso de seed correspondiente.

## Admin por país — cuentas creadas

| País | Email | Rol | Acceso |
| --- | --- | --- | --- |
| Chile (`cl`) | `admin.cl@hireeo.app` | Admin | Solicitar valor de prueba seguro |
| Argentina (`ar`) | `admin.ar@hireeo.app` | Admin | Solicitar valor de prueba seguro |
| Uruguay (`uy`) | `admin.uy@hireeo.app` | Admin | Solicitar valor de prueba seguro |
| España (`es`) | `admin.es@hireeo.app` | Admin | Solicitar valor de prueba seguro |
| Estados Unidos (`us`) | `admin.us@hireeo.app` | Admin | Solicitar valor de prueba seguro |

Cada cuenta está asignada exclusivamente a su país y puede acceder a
`/{country}/admin`.

## Usuarios de prueba seedados

El comando `pnpm --filter backend db:seed:users` crea cinco cuentas Admin y
cinco cuentas Client por cada país. A la fecha de esta documentación, estas
cuentas aún no existen en la base local; ejecutar el seed antes de usarlas.

| Rol | Patrón de email | Países | Cantidad | Acceso |
| --- | --- | --- | --- | --- |
| Admin | `admin{1-5}.{country}@test.hireeo.dev` | `cl`, `ar`, `uy`, `es`, `us` | 25 | Valor definido por el seed o gestor seguro |
| Client | `client{1-5}.{country}@test.hireeo.dev` | `cl`, `ar`, `uy`, `es`, `us` | 25 | Valor definido por el seed o gestor seguro |

No se documentan cuentas SuperAdmin, usuarios OAuth ni usuarios reales.
