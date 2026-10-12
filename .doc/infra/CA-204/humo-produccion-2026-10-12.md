# CA-204: prueba de humo en producción (2026-10-12)

Push y deploy hechos con el GO de Edgardo (aprobación `cmv5bdmxr00002hevsoy1zp90`): backend `349c356` (`dpl_pV16N7cPJebK5TToFcTWFA8efsdV`), frontend `2329284` (`dpl_DikbK62LPVjtaxaKwKK83hMMZutq`), padre `d638652`. Rollback: backend `hireeo-back-lrvbhvhms`, frontend `hireeo-front-ayp65p7n8`.

Verificado en solo lectura, sin secretos:

- `api.hireeo.app` responde 200; `www.hireeo.app/{cl,ar,uy,es,us}` y `/login` responden 200 (`hireeo.app` redirige 308 a `www`).
- `GET /api/v1/geo/countries/{cl,ar,uy,es,us}`: `paymentsEnabled=false` en los cinco.
- `GET /api/v1/prices?countryCode=<país>`: 403 «Los pagos están deshabilitados» en los cinco; `/prices` sin país devuelve `[]`.
- HTML de las páginas: sin montos con `$` o `€`, sin premium, neto ni checkout. Las menciones a MERCADOPAGO/STRIPE son el campo `gateway` del payload del país, con pagos apagados.
- Lectura pública de datos: regiones de Chile OK. Login con cuenta real de producción: no probado.

QA independiente: Benjamín Torres aprobó Test y la tarjeta quedó en Hecho.
