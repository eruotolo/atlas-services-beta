# Fuentes externas

Fecha de consulta para todas las fuentes: **2026-07-18**. Se priorizaron documentación oficial, normas y advisories del mantenedor.

| Fuente | Organización | Publicación/actualización | Tema y relevancia | Hallazgos |
|---|---|---|---|---|
| [Middleware / Proxy bypass follow-up](https://github.com/vercel/next.js/security/advisories/GHSA-26hh-7cqf-hhc6) | Vercel / GitHub Advisory | 2026-05-07 | Confirma Next `>=16.0.0 <16.2.6`, CVE-2026-45109, CVSS 7.5 y parche 16.2.6 | AUD-013 |
| [Dynamic route Proxy bypass](https://github.com/vercel/next.js/security/advisories/GHSA-492v-c6pp-mqqv) | Vercel / GitHub Advisory | 2026-05-06 | Riesgo de depender solo de Proxy/middleware para autorización | AUD-013 |
| [Next.js SSRF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-c4j6-fc7j-m34r) | Vercel / GitHub Advisory | disponible en advisory | Exposición de la versión instalada a advisories adicionales | AUD-013 |
| [API Security Top 10](https://owasp.org/www-project-api-security/) | OWASP | edición 2023 | Marco principal para autorización, consumo de recursos y flujos sensibles | AUD-003, 005–012 |
| [API1 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | OWASP | 2023 | Exige autorización por cada objeto recibido por ID | AUD-003, 006, 007 |
| [API3 Broken Object Property Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/) | OWASP | 2023 | Sustenta retirar propiedades premium/featured de DTO públicos | AUD-005 |
| [Business Logic Security](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html) | OWASP | fecha no visible | Precios, identidad, ownership y secuencias deben derivarse del servidor | AUD-001, 005, 008 |
| [Third Party Payment Gateway Integration](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Payment_Gateway_Integration_Cheat_Sheet.html) | OWASP | fecha no visible | Validación server-side de monto, firma, estado e idempotencia | AUD-001, 002, 011 |
| [Stripe webhook signatures](https://docs.stripe.com/webhooks/signature?lang=node) | Stripe | documentación viva | Verificación de payload bruto, firma e integridad de webhook | AUD-001, 011 |
| [Stripe Checkout lifecycle](https://docs.stripe.com/payments/checkout/how-checkout-works) | Stripe | documentación viva | Separación entre Checkout y confirmación durable por webhook | AUD-001, 002 |
| [MercadoPago Webhooks](https://www.mercadopago.cl/developers/en/docs/your-integrations/notifications/webhooks) | MercadoPago | documentación viva | Firma, headers y recuperación del recurso | AUD-011 |
| [Google backend authentication](https://developers.google.com/identity/sign-in/web/backend-auth) | Google | documentación viva | Requiere verificar `aud`; `tokeninfo` es para depuración | AUD-010 |
| [Multer advisory GHSA-72gw-mp4g-v24j](https://github.com/advisories/GHSA-72gw-mp4g-v24j) | GitHub Advisory | 2025/2026 según advisory | Versión alcanzable desde upload y rango corregido | AUD-012 |
| [protobufjs advisory](https://github.com/advisories/GHSA-xq3m-2v4x-88gg) | GitHub Advisory | advisory actual | Critical transitivo; relevancia condicionada a alcanzabilidad | AUD-013 |
| [Vercel WebSockets](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) | Vercel | 2026-06-22 | WebSockets soportados, conexión fijada a una Function solo durante su duración; Redis para estado durable | AUD-007, 017, 023 |
| [Vercel Functions](https://vercel.com/docs/functions) | Vercel | 2026-01-29 | Modelo operativo de Functions | AUD-023 |
| [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting) | NestJS | documentación viva | Almacenamiento distribuido y configuración del throttling | AUD-023 |
| [Expo SecureStore SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/securestore/) | Expo | documentación SDK 54 | Almacenamiento cifrado nativo y consideraciones de backup | AUD-018, 025 |
| [Expo authentication](https://docs.expo.dev/guides/authentication/) | Expo | documentación viva | Patrones de sesión para apps Expo | AUD-018 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | W3C | recomendación vigente 2024-12 | Foco, teclado, labels, target size y reduced motion | AUD-022 |
| [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) | Vercel Labs | repositorio vivo | Checklist de UI web y accesibilidad usado en revisión estática | AUD-021, 022 |
| [Ley 21.719](https://www.bcn.cl/leychile/Navegar?idNorma=1209272&idParte=10527471&idVersion=2026-12-01) | Biblioteca del Congreso Nacional de Chile | publicada 2024-12-13; vigencia 2026-12-01 | Régimen chileno futuro de protección de datos | AUD-003, 006, 009, 020 |
| [Ley 19.628](https://www.bcn.cl/leychile/Navegar?idNorma=141599&idParte=8642686) | Biblioteca del Congreso Nacional de Chile | vigente hasta 2026-11-30 | Marco chileno actual de datos personales | AUD-003, 006, 009 |
| [Ley 25.326](https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion) | Argentina.gob.ar | texto actualizado | Datos personales para operación en Argentina | AUD-020 |
| [Ley 18.331](https://www.gub.uy/unidad-reguladora-servicios-comunicaciones/sites/unidad-reguladora-servicios-comunicaciones/files/2021-09/Ley18.331_0.pdf) | Gobierno de Uruguay | PDF oficial | Datos personales para operación en Uruguay | AUD-020 |
| [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj) | Unión Europea | 2016; vigente | Datos personales para operación en España/UE | AUD-020 |
| [Habitissimo: cómo funciona](https://www.habitissimo.es/como_funciona) | Habitissimo | página pública vigente | Directorio, solicitudes de presupuesto, perfiles y opiniones | Mercado |
| [GetNinjas: pedidos](https://www.getninjas.com.br/central-de-ajuda/profissional/pedidos-sou-profissional/como-funcionam-os-pedidos) | GetNinjas | ayuda oficial vigente | Modelo de leads/pedidos para profesionales | Mercado |
| [GetNinjas: monedas](https://www.getninjas.com.br/central-de-ajuda/profissional/pagamento/o-que-sao-moedas) | GetNinjas | ayuda oficial vigente | Monetización mediante créditos para desbloquear contactos | Mercado |
| [Taskrabbit: service fee](https://support.taskrabbit.com/hc/en-ca/articles/46260411872155-What-s-the-Taskrabbit-Service-Fee) | Taskrabbit | ayuda oficial vigente | Transparencia de tarifa del marketplace | Mercado |
| [Thumbtack 2024 Fact Sheet](https://press.thumbtack.com/wp-content/uploads/2024/05/Thumbtack-2024-Fact-Sheet.pdf) | Thumbtack | 2024-05 | Referencia pública de marketplace de servicios y escala | Mercado |

## Criterio de confianza

Las fuentes normativas y del mantenedor sustentan decisiones de seguridad/compatibilidad. Las páginas de competidores solo sustentan información pública visible; las oportunidades de producto se presentan como inferencias, no como hechos internos sobre esas empresas.

