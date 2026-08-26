# Plan E2E — alta y publicación de servicios por país

**Objetivo:** comprobar, desde una sesión sin autenticación, que un visitante puede abrir `/{country}/publish`, registrar una cuenta nueva, completar la creación de un servicio Básico y confirmar que queda públicamente visible en el país correcto.

**Países bajo prueba:** `cl`, `uy`, `ar`, `es` y `us`.

## Alcance

- Solo el camino de publicación Básica gratuita. No se inicia el pago Premium ni se usan proveedores OAuth.
- Se prueba mediante la interfaz real y con DevTools del navegador, sin crear usuarios, sesiones ni servicios por API antes del flujo.
- Cada país usa un usuario y un servicio irrepetibles, por lo que las corridas pueden realizarse en paralelo sin colisiones de email o slug.
- La evidencia final exige la vista de éxito, la URL pública del servicio y una comprobación de que el servicio está listado/visible bajo el mismo país.

## Hallazgos previos a la ejecución

1. La ruta activa es `/{country}/publish`; las pruebas Playwright existentes aún usan rutas legacy como `/publicar`, por lo que no validan este flujo multi-país.
2. El primer paso registra al visitante como invitado y conserva su `usuarioId` para continuar el wizard. Sin embargo, el endpoint `POST /services` está protegido por `JwtAuthGuard`. El plan debe comprobar en DevTools si el alta de invitado obtiene una sesión/token válido antes de crear el servicio; de no ser así, la prueba debe registrar el bloqueo con su solicitud/respuesta, sin enmascararlo.
3. País, región y localidad deben proceder de los selectores que cargan datos desde la API. No se usarán valores hardcodeados en el guion de prueba.

### Errores de contrato — estado verificado contra código (2026-08-24)

La tabla original listaba 8 hallazgos por inspección de código, previos a cualquier corrida E2E real. Re-verificados contra el código actual:

| ID | Hallazgo original | Estado 2026-08-24 |
|---|---|---|
| E2E-PUB-001 | Alta de invitado sin sesión, pero `POST /services` exige JWT | ✅ Resuelto — `Paso1DatosUsuario.tsx:104` crea sesión (`signIn('credentials', ...)`) tras `verificarOCrearUsuario` |
| E2E-PUB-002 | Payload en inglés vs DTO en español | ✅ Resuelto — `mutations.ts:100-113` ya envía `titulo/comuna/redesSociales` |
| E2E-PUB-003 | Selector entrega `localitySlug` pero no se setea `comuna` | ✅ Resuelto — `Paso2TuOficio.tsx:280` setea `comuna` |
| E2E-PUB-004 | País/región/localidad no llegan al payload | ✅ Resuelto — mismo fix que 003/007 (`countryCode`, `comuna` ya viajan) |
| E2E-PUB-005 | Categorías se piden sin país, caen a `cl` por defecto | ✅ Resuelto — `Paso2TuOficio.tsx:187` pasa `countryCode` a `getCategorias()` |
| E2E-PUB-006 | "Precio 0 permitido en UI pero el DTO exige positivo" | ❌ Premisa incorrecta — `create-service.dto.ts` usa `@Min(0)`, no exige positivo estricto; precio `0` es válido para el contrato actual. No es un bug, es una regla de negocio a confirmar si se quiere cambiar. |
| E2E-PUB-007 | Registro con `name/phone/isGuest` vs DTO `nombre/telefono/country` | ✅ Resuelto — `mutations.ts` ya envía las claves en español + `country` |
| E2E-PUB-008 | DevTools sin permiso para cargar archivos locales vía extensión | 🟡 Sigue vigente — es una limitación del entorno de prueba (Chrome extension), no del código. Requiere ajustar permisos de la extensión antes de correr el caso con imágenes reales. |

**Los 4 fixes de código de esta tabla corresponden al registro histórico DT-29/30/31/32, ya cerrado.** Lo único que sigue pendiente de este plan es **ejecutar la corrida E2E real** (nunca se corrió) y resolver E2E-PUB-008 antes de poder completar el paso de carga de imágenes.

## Preparación

1. Levantar frontend, backend y base de datos con la configuración local de pruebas y confirmar que hay datos geo y categorías para los cinco países.
2. Abrir una ventana o perfil limpio por caso; borrar cookies y almacenamiento del dominio antes de navegar. La primera carga de cada caso debe mostrar una sesión anónima.
3. Abrir DevTools y conservar estas pestañas activas:
   - **Network:** preservar registro, desactivar caché y filtrar `Fetch/XHR`.
   - **Console:** registrar errores de JavaScript y advertencias relevantes.
   - **Application:** revisar únicamente la presencia/ausencia de sesión tras el registro, sin inspeccionar datos personales ajenos.
4. Preparar cinco imágenes de fixture permitidas por caso (JPG/PNG/WEBP, máximo 3 MB cada una): una principal y cuatro de galería. Usar archivos visualmente distinguibles para verificar orden y persistencia.
5. Generar datos por ejecución: `E2E Publish <PAIS> <timestamp>`, `e2e-publish-<pais>-<timestamp>@example.test`, teléfono de prueba válido para el país y URLs válidas para cada tipo de red social. El título es la clave de verificación pública.

## Matriz de ejecución

| Caso | Inicio anónimo | Datos de ubicación | Resultado esperado |
|---|---|---|---|
| CL | `/cl/publish` | Elegir Región y Comuna disponibles | Servicio visible bajo `/cl/service/{slug}` y en búsqueda/listado de Chile |
| UY | `/uy/publish` | Elegir Departamento y Localidad disponibles | Servicio visible bajo `/uy/service/{slug}` y en búsqueda/listado de Uruguay |
| AR | `/ar/publish` | Elegir Provincia y Localidad disponibles | Servicio visible bajo `/ar/service/{slug}` y en búsqueda/listado de Argentina |
| ES | `/es/publish` | Elegir Comunidad autónoma y Localidad disponibles | Servicio visible bajo `/es/service/{slug}` y en búsqueda/listado de España |
| US | `/us/publish` | Elegir Estado y Localidad disponibles | Servicio visible bajo `/us/service/{slug}` y en búsqueda/listado de Estados Unidos |

Los rótulos se toman de la interfaz y no se fuerzan en los selectores; son distintos por `CountryProvider`.

## Guion E2E por cada país

1. Navegar directamente a `/{country}/publish` sin usuario logueado y capturar una evidencia de la URL, el paso **Tus Datos** y la ausencia de datos de perfil prellenados.
2. Completar nombre, email único, teléfono y aceptación de términos. Pulsar **Continuar al Siguiente Paso**.
3. En DevTools, validar la solicitud de registro:
   - `POST /auth/register` devuelve éxito y el email de la ejecución;
   - no se producen errores de consola;
   - si el flujo requiere token/sesión para publicar, confirmar que este se obtuvo de una forma válida para el visitante recién creado.
4. Esperar el paso **Tu Oficio** y verificar que categoría, región y localidad se cargaron para el país actual. Completar todos los campos disponibles:
   - título único, entre 5 y 100 caracteres;
   - hasta tres categorías disponibles del país;
   - descripción de al menos 20 caracteres usando **Completar con IA**, revisándola y editándola antes de enviar; si la integración IA falla, documentar la incidencia y reintentar con una descripción manual solo para completar el resto del flujo;
   - imagen principal y las cuatro imágenes de galería;
   - precio positivo compatible con la moneda del país;
   - región y localidad disponibles;
   - nombre, correo y teléfono de contacto, usando la opción **Usar mis datos de registro** y verificando el autocompletado;
   - todos los tipos disponibles de redes sociales/sitio web: Website, Facebook, Instagram, LinkedIn, TikTok, Twitter/X, YouTube y Otro, cada uno con una URL válida y distinguible;
   - declaración de veracidad/condiciones de publicación.
5. Antes de enviar, verificar las previsualizaciones de las cinco imágenes, el valor de todos los campos y las ocho URLs sociales. Enviar el formulario. En Network, comprobar cada carga de imagen y el `POST /services`; conservar request/response: código 2xx, `slug`, país, región, localidad, categoría, URLs de imágenes y redes sociales coherentes con el caso. Si existe cualquier 4xx/5xx, error de consola o mensaje de UI, registrar la incidencia y detener ese caso; no continuar como si hubiese publicación.
6. Elegir **Publicar Gratis**. Confirmar la pantalla **¡Servicio Publicado!** y usar **Ver servicio** antes del redireccionamiento automático.
7. Comprobar la URL `/{country}/service/{slug}` y que el detalle contiene el título único, categoría, ubicación, precio, contacto, las ocho URLs sociales y las cinco imágenes ingresadas. Validar en Network que la lectura del servicio es exitosa y que no cambia el prefijo de país.
8. Abrir una nueva pestaña anónima, buscar o navegar al listado del mismo `/{country}` y confirmar que el título único aparece. Hacer una comprobación negativa breve: el mismo slug/título no debe aparecer al consultar otro país.
9. Guardar captura de la pantalla de éxito, detalle, listado y exportación HAR/trace de Network. Anotar URL, slug, identificador de ejecución y resultado en la matriz de evidencia.

## Criterios de aprobación

- Los cinco casos empiezan sin sesión y no reutilizan un usuario existente.
- En los cinco casos el usuario se crea desde el wizard y el servicio llega al detalle público con HTTP 2xx.
- Cada servicio se muestra bajo su mismo prefijo `/{country}` y en el listado/búsqueda de ese país, sin filtrarse a los otros cuatro.
- No hay errores de consola ni solicitudes fallidas que afecten registro, carga de geo/categorías, creación o lectura del servicio.
- La evidencia permite reconstruir cada recorrido: datos de ejecución, capturas, URL/slug y Network.
- Se cargan y se visualizan correctamente la imagen principal, las cuatro imágenes adicionales y los ocho tipos de red social/sitio web para cada uno de los cinco servicios.

## Automatización posterior con Playwright

Tras validar una corrida manual estable con DevTools, agregar una especificación dedicada, por ejemplo `frontend/tests/e2e/publish-guest-multicountry.spec.ts`, que itere sobre `cl`, `uy`, `ar`, `es` y `us`.

- Ejecutar cada caso con `storageState` vacío y datos únicos por corrida.
- Usar selectores semánticos/roles; donde no existan, incorporar `data-testid` mínimos y estables en el wizard, no selectores de estilos o texto traducible.
- Interceptar/observar `POST /auth/register` y `POST /services`; afirmar estado, `countryCode`, `regionCode`, `localitySlug` y `slug` de respuesta.
- Verificar la URL de detalle y la presencia del título único en el listado filtrado por país; incluir la comprobación negativa transversal.
- Mantener trace, screenshot y video ante fallo. Ejecutar la suite con los servicios locales preparados y datos geo sembrados.

## Gestión de datos de prueba

Las publicaciones creadas son persistentes. Antes de la primera ejecución se debe acordar un entorno aislado de E2E o un mecanismo autorizado de limpieza por identificador/título. No se eliminarán servicios de forma manual ni automática durante esta fase sin dicha autorización.

## Registro obligatorio de errores

Por cada fallo se creará un registro en la carpeta de evidencias con nombre `E2E-PUB-<país>-<timestamp>.md`. Debe incluir: ID, país, URL, paso, datos no sensibles usados, comportamiento esperado, comportamiento observado, severidad, captura, extracto de Console, request/response sanitizados de DevTools, HAR/trace, servicio/archivo responsable si se conoce y criterio de reproducción. Los datos personales y tokens deben quedar ocultos.

La corrección de un error exige repetir desde cero el caso anónimo de ese país y, cuando afecte contratos compartidos, la matriz completa de cinco países. No se cerrará una incidencia basándose solo en una prueba unitaria o en una llamada directa a API.

## Entregables de la ejecución

1. Matriz final de cinco resultados (`PASS`, `FAIL` o `BLOCKED`) con URL y slug por país.
2. Carpeta de evidencias con capturas, Network/HAR o trace y errores de consola cuando existan.
3. Incidencias separadas por causa raíz si falla registro, autenticación del invitado, datos geo/categorías, persistencia, aislamiento de país o visibilidad pública.
