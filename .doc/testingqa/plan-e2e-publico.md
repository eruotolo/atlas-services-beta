---
title: Plan E2E Público por país
tags: [hireeo, testing, e2e, publico]
---

# Plan E2E — Público

Referencia: [[README]] · arquitectura: [roles](../arquitectura/roles-y-funciones.md) y [flujos](../arquitectura/flujos-hireeo.md).

**Objetivo:** demostrar que un visitante anónimo puede descubrir contenido, navegar y autenticarse en su país, sin acceder a datos ni acciones protegidas. Ejecutar todos los casos en los **5 países**.

## Casos de navegación y descubrimiento

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-PUB-001 | Abrir `/`; probar prioridad cookie, cabeceras disponibles y fallback. | Redirige a `/{country}` válido; country activo carga Home. |
| E2E-PUB-002 | Abrir Home, selector de país, navbar/footer y enlaces principales. | Cada enlace preserva/cambia correctamente el prefijo y no hay enlaces legacy rotos. |
| E2E-PUB-003 | Usar búsqueda desde Home: texto, categoría detectada, región/localidad, ubicación/código postal si aparece. | URL y resultados conservan filtros; geo es dinámico del país. |
| E2E-PUB-004 | Abrir `/search`; combinar y limpiar texto, categoría, nivel, región y localidad. | Solo aparecen servicios activos/vigentes del país; orden destacado/rating consistente. |
| E2E-PUB-005 | Abrir ficha desde resultados, galería, precio, ubicación, redes, reseñas y relacionados. | Detalle completo; slug cuyo país real difiere redirige al prefijo canónico. |
| E2E-PUB-006 | Accionar teléfono, email, llamada o WhatsApp cuando estén disponibles. | Se ejecuta la interacción pública sin bloquear lectura ni filtrar información ajena. |
| E2E-PUB-007 | Recorrer pricing y contenido informativo: how-it-works, about-us, help, contacto y todos los documentos legales. | Estado 200/render correcto, navegación país-preservada y contenido sin referencias geográficas incorrectas. |

## Autenticación y límites

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-PUB-008 | Login: vacío, email inválido, contraseña incorrecta, cuenta válida de cada rol y logout. | Validaciones claras; redirección por rol: Client/Professional perfil, Admin admin del país, SuperAdmin `/config`. |
| E2E-PUB-009 | Registro: validaciones, términos, datos válidos únicos y duplicado. | Cuenta Client creada en el país de contexto; duplicado no crea otra cuenta. |
| E2E-PUB-010 | Recuperación de contraseña: email inválido/no existente/existente, enlace de sandbox, nueva contraseña y login. | No revela cuentas, token de sandbox funciona una vez y credenciales anteriores dejan de servir. |
| E2E-PUB-011 | Intentar chat, favorito, reseña, wizard de solicitud y rutas `/profile`, `/admin`, `/config` sin sesión. | Se solicita login o se deniega; no hay mutación parcial. |
| E2E-PUB-012 | Abrir una URL admin/profile de otro país y rutas legacy. | Proxy aplica login/unauthorized/redirección esperada; jamás concede acceso. |

## Wizards públicos

| ID | Wizard | Cobertura |
|---|---|---|
| E2E-PUB-013 | Publicar sin sesión | Ejecutar [[plan-e2e-publicacion-multipais]]: Datos, registro/autosesión, Oficio, imágenes, IA opcional, geo, Básico, Premium/cancelación y detalle público. |
| E2E-PUB-014 | Solicitud de servicio | Si el CTA está público, verificar que pide autenticación sin crear `ServiceRequest`; si se inicia tras login, la continuidad se cubre en [[plan-e2e-client]]. |

## Casos negativos por país

1. El mismo servicio/slug, categoría, región o localidad de un fixture no debe visualizarse bajo otro país.
2. Los rótulos de geo y formato monetario deben coincidir con la matriz de [[README]].
3. Con país inactivo, la parte pública muestra `CountryComingSoon`; no exponer flujos de compra/publicación como disponibles.
4. Registrar errores de Console, peticiones 4xx/5xx y recursos de terceros bloqueados como incidencia, no como éxito parcial.
