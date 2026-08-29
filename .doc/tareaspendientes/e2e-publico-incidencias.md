---
title: Incidencias — E2E Público
tags: [hireeo, testing, e2e, publico, incidencias]
---

# Incidencias detectadas — plan-e2e-publico.md

Referencia: [[../testingqa/plan-e2e-publico]]. Entorno: frontend `http://localhost:3334`, backend `http://localhost:4445/api/v1`, DB local (`docker-database`, puerto 5435). Ejecución iniciada 2026-08-27.

> [!success] Estado de resolución (remediación 2026-08-29, [[grok-e2e-incidencias]])
> - **INC-001 — RESUELTO.** `HeroSearchBar.tsx`: ubicación libre se resuelve por match difuso contra localidades reales (`locality=slug`) o se ignora, nunca viaja como `q`; el texto del problema ahora sí viaja en `q` junto a la categoría (`c`). `matchmaking.ts`: los 13 slugs de `CATEGORY_MAP`/`CATEGORY_LABELS` fueron corregidos contra `GET /categories` real (`gasfiteria`→`plomeria`, etc., ver diff de la fase F5).
> - **INC-002 — RESUELTO** (diseño revisado, decisión de Edgardo 2026-08-29). El flujo real es "email con password nueva" (no token/link, `AUD-12`) — se preserva esa decisión. Fix: el email se envía **antes** de persistir el cambio; si falla, no se toca `password`/`emailVerified`/`tokenVersion`. Tests unitarios cubren ambos casos (éxito y fallo de envío).

## INC-001 — Buscador del Home: el texto libre de ubicación se manda como texto de búsqueda, no como filtro geográfico

- **Caso**: E2E-PUB-003
- **Severidad**: Alta (falso negativo: un servicio que existe y coincide no aparece en los resultados)
- **País**: `cl` (bug de componente compartido — no depende del país, ver "Alcance" abajo)
- **Rol**: Público / anónimo

**Pasos**:
1. Ir a `/cl` (Home), sin sesión.
2. En "Describe el problema", escribir `tengo una fuga en el baño`.
3. En "Comuna o Región", escribir `Arica` **a mano, sin seleccionarla del dropdown de autocompletado**.
4. Click en "Buscar".

**Esperado**: según E2E-PUB-003, "URL y resultados conservan filtros; geo es dinámico del país" — se esperaría encontrar el servicio de Plomería en Arica que ya está listado en el propio Home.

**Observado**: navega a `/cl/search?q=Arica&c=gasfiteria` y muestra **"0 profesionales encontrados"**, aunque el servicio `Servicio de Plomería en Chile` (comuna Arica) existe y está activo. El panel de filtros lateral incluso muestra "Plomería 1" como contador disponible, contradiciendo el "0" del resultado principal.

**Causa raíz** (`frontend/src/features/home/components/HeroSearchBar/HeroSearchBar.tsx:143-176`, función `handleSearch`):
- Si el usuario escribe la ubicación a mano y no la selecciona del dropdown (`selectedLocality` sigue `null`), el texto se manda como `params.set('q', location)` — el parámetro `q` es el campo de **búsqueda de texto libre** en `/search`, no un filtro geográfico. La comuna nunca se aplica como filtro de región/ciudad.
- El texto de "Describe el problema" (`query`) se usa **solo** para llamar a `matchServiceCategory(query)` y obtener un slug de categoría (`c`); el texto original se descarta y nunca llega como filtro de búsqueda.

**Bug relacionado (misma causa raíz, agrava el efecto)** — el slug de categoría devuelto por el matchmaking no existe en el catálogo real:
- `matchServiceCategory` usa `CATEGORY_MAP`/`CATEGORY_LABELS` en `frontend/src/features/services/actions/matchmaking.ts:6-27` como taxonomía candidata para la IA (`/chatbot/ai/detect-category`) y como fallback local por keywords.
- Esa lista usa el slug `gasfiteria` para plomería. La tabla real `service_categories` en la base de datos usa el slug `plomeria` (verificado: `SELECT slug FROM service_categories WHERE name = 'Plomería'` → `plomeria`).
- Resultado: el filtro `c=gasfiteria` nunca matchea ninguna categoría real, sin importar si el texto de ubicación se hubiera mandado bien.

**Alcance multi-país**: `HeroSearchBar.tsx` y `matchmaking.ts` son componentes compartidos sin lógica específica de país — el bug aplica a los 5 países por igual. `CATEGORY_MAP` no está confirmado como sincronizado con las categorías reales de ningún país; no se descarta que otras entradas del mapa (`jardineria`, `techos`, `linea-blanca`, `climatizacion`, etc.) tengan el mismo problema de slug inexistente — pendiente de auditoría completa contra `service_categories`.

**Reproducción rápida (afecta también a búsqueda por voz/texto libre sin dropdown)**: cualquier búsqueda desde Home donde el usuario no elija la ubicación del autocompletado sufre el mismo problema de `q` mal usado, independientemente del texto de categoría.

**Nota**: si el usuario SÍ selecciona la localidad del dropdown de autocompletado, `selectedLocality` se llena y el filtro `locality=<slug>` se aplica correctamente — el bug ocurre solo cuando se escribe la ubicación a mano y se envía el formulario sin seleccionar una sugerencia (flujo perfectamente plausible para un usuario real, especialmente en países con lista de localidades no exhaustiva o con typos).

---

## INC-002 — "Olvidé mi contraseña" deja la cuenta bloqueada si falla el envío de email (sin transacción, sin aviso)

- **Caso**: E2E-PUB-010
- **Severidad**: Crítica (pérdida de acceso a la cuenta, sin mensaje de error, sin forma de recuperación)
- **País**: `cl` (bug en `auth.service.ts`, código no específico de país — aplica a los 5)
- **Rol**: Público / anónimo

**Pasos**:
1. Ir a `/forgot-password`.
2. Ingresar el email de una cuenta real (se probó con `client2.cl@hireeo.app`).
3. Enviar el formulario.

**Esperado**: según E2E-PUB-010, "token de sandbox funciona una vez y credenciales anteriores dejan de servir" — implica que el flujo de reset debe completarse de punta a punta (nueva contraseña llega, funciona, y la vieja deja de servir) o, si algo falla, el usuario debe enterarse y conservar acceso con su contraseña anterior.

**Observado**: el frontend muestra el mensaje genérico esperado ("Si el email está registrado, te enviamos una contraseña nueva.") pero **la contraseña de la cuenta se sobrescribió en la base de datos aunque el envío del email falló** (log del backend: `Error al solicitar nueva contraseña: Error [ApiError]: Integration "Brevo (email)" not configured`, seguido de `POST /forgot-password 200`). Se verificó directamente en la tabla `users` que el hash de `client2.cl@hireeo.app` cambió. Como el email con la contraseña nueva nunca se envió (ni se pudo enviar, al no haber integración Brevo configurada en este entorno), **la cuenta queda inaccesible**: la contraseña anterior ya no sirve y la nueva nunca llegó a ningún lado. Se restauró manualmente el hash de prueba estándar vía SQL para no dejar la cuenta de fixture inutilizable.

**Causa raíz** (`backend/src/modules/auth/auth.service.ts:282-309`, método `forgotPassword`):
```ts
await this.prisma.user.update({
    where: { id: user.id },
    data: { password: hash, emailVerified: true, tokenVersion: { increment: 1 } },
});

await this.email.send(  // si esto falla, el password YA se persistió — sin rollback
    email, user.name, 'Tu nueva contraseña en Hireeo',
    buildForgotPasswordEmailHtml(user.name, newPassword),
);
```
No hay transacción ni compensación: la contraseña se persiste **antes** de confirmar que el email se pudo enviar. Si `this.email.send(...)` lanza (proveedor no configurado, caído, rate-limited, credencial vencida, timeout de red — cualquier falla transitoria de un servicio externo), la excepción se propaga hacia arriba, pero el `user.update` anterior ya se ejecutó y no se revierte.

El frontend agrava el efecto de forma intencional: `frontend/src/features/auth/actions/mutations.ts:78-84` atrapa **cualquier** error de la llamada y siempre devuelve el mismo mensaje de éxito genérico (`FORGOT_PASSWORD_GENERIC_MESSAGE`), por diseño explícito — "no revelar si fue un error real o si el email no existe" (AUD-08/AUD-12). Ese diseño es correcto para no confirmar/negar cuentas, pero combinado con el bug de persistencia sin transacción, el resultado es que ni el usuario ni nadie observando la UI se entera de que la cuenta quedó bloqueada.

**Impacto**: cualquier interrupción real del proveedor de email (no solo la falta de configuración de este entorno local) deja fuera de su cuenta a cualquier usuario que use "olvidé mi contraseña", sin aviso y sin vía de recuperación hasta que un humano revise logs del backend.

**Sugerencia de fix** (no aplicado — solo diagnóstico): invertir el orden (enviar el email primero, persistir el password solo si el envío fue exitoso) o envolver ambos pasos en una transacción con compensación explícita (revertir el `user.update` si `email.send` falla).

---

## Nota de documentación (no es bug) — E2E-PUB-005, slug cruzado entre países

El caso dice "slug cuyo país real difiere redirige al prefijo canónico". El comportamiento real es **404**, no redirect, cuando el slug simplemente no existe bajo ese país (caso normal, ya que el slug es único por país — decisión documentada como AUD-32 en `frontend/src/features/services/actions/queries.ts:183-184`). El código de redirect (`frontend/src/app/(country)/[country]/(public)/service/[slug]/page.tsx:122-125`) sí existe, pero solo se activa si el backend devolviera un servicio con `countryCode` distinto al de la URL — algo que no ocurre en la búsqueda actual porque el backend ya filtra por `slug + countryCode`.

**Resuelto (Gate `G-SLUG`, plan canónico [[grok-e2e-incidencias]] §7, 2026-08-29): el resultado esperado ante un slug ajeno es 404.** El caso E2E-PUB-005 queda actualizado con ese criterio de aceptación; el redirect existente es defensivo para colisiones de slug entre países (mismo slug generado independientemente en dos países), no para el caso general.

---

## Estado de ejecución

Ejecución en curso — ver seguimiento en la conversación con Edgardo.

| Caso | Resultado | Alcance verificado |
|---|---|---|
| E2E-PUB-001 | PASS | HTTP, los 5 países (lógica agnóstica de país) |
| E2E-PUB-002 | PASS | Browser, `cl` (navbar/footer, prefijos de país correctos; `/login`, `/register`, `/contact` sin prefijo son diseño intencional — `GLOBAL_PATHS` en `proxy.ts`) |
| E2E-PUB-003 | **FAIL — INC-001** | Browser, `cl`. Bug de componente compartido, alcance multi-país |
| E2E-PUB-004 | PASS | Browser, `cl` (categoría, región, ciudad dinámica, combinación y limpiar filtros) |
| E2E-PUB-005 | PASS (con nota de documentación) | Browser, `cl` (galería, precio, ubicación, reseñas). Slug cruzado entre países: 404, no redirect — ver nota arriba |
| E2E-PUB-006 | PASS | Browser, `cl` (teléfono `tel:` directo sin sesión, Chat pide login) |
| E2E-PUB-007 | PASS | HTTP, los 5 países (19 páginas informativas/legales, todas 200) |
| E2E-PUB-008 | PASS | Browser, `cl` (vacío, credenciales incorrectas → "Credenciales inválidas" genérico, Client → `/cl/profile`, Admin → `/cl/admin`, SuperAdmin → `/config`, logout en los 3 casos) |
| E2E-PUB-009 | PASS | Browser, `cl` (vacío → validaciones de todos los campos; email duplicado → "Este email ya está registrado" sin crear cuenta nueva; datos válidos → cuenta Client creada en `cl`, login posterior funciona. Fixture de prueba eliminado tras verificar) |
| E2E-PUB-010 | **FAIL — INC-002** | Browser, `cl`. Bug de backend no específico de país, alcance multi-país |
| E2E-PUB-011 | PASS | HTTP + Browser, los 5 países vía HTTP (`/profile`, `/admin` → 307 a `/login`); Chat/Solicitar confirmado en browser para `cl` |
| E2E-PUB-012 | PASS | HTTP, los 5 países (rutas legacy sin prefijo agregan `/cl` por fallback; `/config` sin país es diseño correcto, no country-scoped) |
| E2E-PUB-013 | Pendiente | Requiere sandbox MercadoPago/Stripe — no iniciado |
| E2E-PUB-014 | PASS | Browser, `cl` ("Solicitar este servicio" sin sesión pide login, cero `ServiceRequest` creados) |

**Alcance por país**: la verificación interactiva completa (browser) se hizo en `cl`. En `ar`/`uy`/`es`/`us` se verificó por HTTP lo estructural (redirects, status 200, protección de rutas) — ver filas arriba. Los dos bugs encontrados (INC-001, INC-002) están en código compartido sin lógica de país, por lo que aplican a los 5 países por igual, pero no se confirmó interactivamente en cada uno. Pendiente: E2E-PUB-013 (wizard de publicación completo, requiere credenciales de sandbox de pago MercadoPago/Stripe) y réplica interactiva completa en `ar`/`uy`/`es`/`us`.
