# Competencia e investigación externa

## Mercado y competidores

Hireeo opera en **5 países** (cl, ar, uy, es, us) en dos verticales:
1. **Marketplace de servicios del hogar** (electricistas, carpinteros, gasfiter, fletes, mudanzas).
2. **Marketplace de profesionales** con mensajería transaccional.

### Competidores directos (funcionalidad comparable)

| Competidor | País | URL | Foco | Modelo |
|---|---|---|---|---|
| **TaskRabbit** | US/UK/ES/CA/FR/IT/DE | taskrabbit.com | Servicios del hogar + mensajería | Pago centralizado, comisión % |
| **Thumbtack** | US | thumbtack.com | Cotizaciones de profesionales | Leads pagados por proveedor |
| **HireAHelper** | US | hireahelper.com | Mudanzas/fletes | Pago directo |
| **Fixly** | Polonia/Europa | fixly.pl | Servicios del hogar | Freemium + leads pagados |
| **Cronoshare** | España/Colombia/Chile/Brasil/México | cronoshare.com | Servicios profesionales | Leads |
| **Workana** | LATAM | workana.com | Freelancers | Proyecto/comisión |
| **Soihub** | LATAM | soihub.com | Marketplace de servicios LATAM | Freemium |
| **ServiAliados** | México | servialiados.com | Hogar LATAM | Freemium |
| **Homie.mx** | México | homie.mx | Real estate (referente UX) | — |

### Competidores indirectos

- **WhatsApp Business / Instagram DM**: muchos proveedores usan canales informales.
- **Facebook Marketplace / Grupos**: servicios locales.
- **Yapo.cl / MercadoLibre CL**: clasificados generales.
- **MercadoLibre CL Servicios**: extensión de MercadoLibre.

---

## Funcionalidades comunes del sector

| Funcionalidad | Hireeo | TaskRabbit | Thumbtack | Cronoshare | Fixly | Notas |
|---|---|---|---|---|---|---|
| Marketplace por país | ✅ | ✅ | ⚠ US-centric | ✅ ES/LATAM | ⚠ PL-centric | Hireeo multi-país es diferenciador |
| Multi-moneda (CLP/ARS/UYU/EUR/USD) | ✅ | ❌ | ❌ | ❌ | ❌ | Único diferenciador fuerte |
| Multi-pasarela (Stripe + MercadoPago) | ✅ | ❌ | ❌ | ❌ | ❌ | Diferenciador |
| Categorías + subcategorías | ✅ | ✅ | ✅ | ✅ | ✅ | Estándar |
| Multi-idioma | ✅ ES/EN | ✅ múltiples | ✅ | ✅ | ⚠ | Hireeo actual: ES+EN básico |
| Geo (país → región → comuna) | ✅ | ✅ ZIP | ✅ ZIP | ✅ ciudad | ✅ ciudad | Hireeo: geo refinado |
| Reviews bidireccionales | ⚠ (sólo cliente→proveedor) | ✅ | ✅ | ✅ | ✅ | Hireeo: GAP, recomendado añadir |
| Mensajería in-app | ✅ Socket.io | ✅ | ✅ | ✅ | ✅ | Estándar |
| Verificación KYC | ⚠ módulo existe sin uso | ✅ | ✅ | ✅ | ✅ | Hireeo: GAP crítico |
| Escrow / pago retenido | ⚠ módulo existe sin uso | ✅ | ❌ | ❌ | ✅ | Hireeo: GAP crítico |
| Pagos recurrentes (suscripciones premium) | ✅ | ⚠ | ⚠ | ❌ | ⚠ | Hireeo: diferenciado |
| Búsqueda con filtros | ✅ | ✅ | ✅ | ✅ | ✅ | Estándar |
| Notificaciones push | ⚠ (rutas rotas) | ✅ | ✅ | ✅ | ✅ | Hireeo: GAP técnico |
| Pago en cuotas | ❌ | ❌ | ❌ | ❌ | ❌ | Oportunidad futura |
| Modo oscuro | ❌ | ✅ | ✅ | ✅ | ✅ | Gap UX |
| App móvil | ✅ (Expo) | ✅ | ✅ | ✅ | ✅ | Hireeo: bloqueada por issues |

---

## Buenas prácticas observadas en el sector

### TaskRabbit
- **Pago centralizado con escrow**: el cliente paga al reservar; Hireeo retiene hasta confirmación.
- **KYC obligatorio antes de publicar**: requiere SSN, dirección, background check en US.
- **Trust & Support badge**: indicadores visuales de calidad/seguridad.
- **Disputas con mediación**: equipo dedicado.
- **Chat con bloqueo de contacto**: hasta que se reserva, sin contacto directo.

### Thumbtack
- **Modelo de leads**: el profesional paga por recibir cada lead.
- **Proceso de cotización estructurado**: el profesional envía cotización detallada, no solo un precio.

### Cronoshare (referente LATAM/España)
- **Multi-idioma (ES + PT)**: Hireeo tendría que añadir portugués para Brasil si quiere expandirse.
- **Tarifa plana de leads**: mejor que por porcentaje para el profesional.
- **Geolocalización**: prioriza los más cercanos.

### Fixly (referente Europa del Este)
- **Reviews con moderación previa**: evita reviews falsas o venganza.
- **Categorías con iconos y descripciones largas**: mejor SEO y UX.
- **Sistema de "profesional destacado"** similar al `featured`/`PREMIUM` de Hireeo.

---

## Estándares de UX observados

- **Onboarding < 3 pasos** (TaskRabbit, Cronoshare): Hireeo tiene wizard de 5+ pasos en publish — puede simplificar.
- **Búsqueda con autocompletar** geográfico (todos): Hireeo tiene pero lento (Nominatim sin cache).
- **Ver fotos del proveedor** (todos): Hireeo tiene avatar + images por servicio, OK.
- **Reviews con foto** (TaskRabbit, Fixly): Hireeo no pide foto con review — oportunidad.
- **Web responsive y PWA** (todos): Hireeo es web app Next.js + app nativa.

---

## Diferenciadores posibles de Hireeo

**Si se ejecuta bien el plan de estabilización**:

1. **Multi-país con moneda y pasarela locales** — único en la región.
2. **Modelo freemium con BASIC/PREMIUM** + escrow para transacciones serias (mudanzas).
3. **Geo refinado** (país → región → comuna/localidad) más granular que ZIP.
4. **IA agente** (`ai-agents` module) para ayudar al usuario a describir su necesidad — pocos competidores lo tienen.

---

## Riesgos de copiar soluciones sin contexto

| Funcionalidad Tentadora | Por qué NO copiar sin contexto |
|---|---|
| **Stripe Connect con KYC automático** | Requiere cumplimiento PCI-DSS adicional; no prioritario hasta volumen. |
| **Subastas inversas** (Thumbtack) | Cambia el modelo de negocio; el usuario actual prefiere ver precios. |
| **Sistema de "trabajos urgentes" con prima** | Requiere equipo de guardia 24/7; Hireeo es freelance. |
| **Verificación por selfie en cada servicio** (TaskRabbit Pro) | Friction de onboarding; Latinoamérica tiene distinta cultura de verificación. |
| **AI auto-respuesta del proveedor** | Requiere más maduración del módulo AI; no antes de validar flujo humano. |

---

## Opiniones recurrentes de usuarios (reclamos) en apps similares

Basado en reseñas públicas de TaskRabbit/Thumbtack/Cronoshare en stores y redes:

- **"La app no responde rápido"** → Hireeo tiene `apiClient` sin timeout (MOB-PERF-001).
- **"Pagué y nunca se activó mi servicio premium"** → Hireeo tiene este MISMO bug (FE-PAY-001/002).
- **"El proveedor me contactó por WhatsApp fuera de la app"** → Hireeo debería implementar bloqueo de contacto.
- **"No puedo cancelar y me cobraron igual"** → política de cancelaciones + escrow es crítico.
- **"Las fotos del servicio son falsas"** → moderación previa + KYC.
- **"La búsqueda no muestra resultados relevantes"** → Hireeo: verificar ranking, full-text search.

---

## Patrones recurrentes del sector (infra/tech)

- **Backend en Node.js** (TaskRabbit, Cronoshare, Fixly) o Ruby (Thumbtack legacy).
- **Frontend web en React/Next.js** (TaskRabbit migró a Next.js).
- **Mobile en React Native** (TaskRabbit, varios LATAM).
- **DB PostgreSQL** (mayoría) o MongoDB (algunos legacy).
- **Stripe Connect** para marketplaces.
- **AWS o GCP** para cloud.

Hireeo ya está en este patrón: Node + Postgres + Next.js + React Native + Stripe. **No se necesita migración tecnológica**.

---

## Hallazgos relacionados de Hireeo vs sector

| Gap Hireeo | Sector lo tiene | Severidad |
|---|---|---|
| Webhook Stripe sin API key (FE-PAY-001) | Todos los competidores tienen suscripciones funcionales | Crítica |
| Stubs MercadoPago (FE-PAY-002) | Todos tienen MP funcional en LATAM | Crítica |
| KYC no exigido (BE-SEC-012) | TaskRabbit/Cronoshare obligatorio | Alta |
| Escrow no implementado en pagos | TaskRabbit/Fixly tienen | Alta |
| Reviews bidireccionales solo cliente→proveedor | Bidireccional en todos | Media |
| Mobile sin posibilidad de release | Todos tienen app en stores | Crítica |
| Multi-idioma limitado (ES+EN) | Competidores LATAM tienen PT | Media (oportunidad) |
| Sin disputas/mediación | Todos tienen | Media |
| Onboarding complejo (publish 5+ pasos) | Estándar < 3 pasos | Media |
| Sin bloqueo de contacto hasta reserva | Estándar en TaskRabbit | Media |

---

## Fuentes externas

- [TaskRabbit](https://www.taskrabbit.com) — visitas al sitio público y reseñas en stores.
- [Thumbtack](https://www.thumbtack.com) — idem.
- [Cronoshare](https://www.cronoshare.com) — idem.
- [Fixly](https://fixly.pl) — idem.
- Reviews públicas en Google Play Store y App Store (resumidas).
- [OWASP Top 10](https://owasp.org/Top10/) — vulnerabilidades.
- [OWASP API Security Top 10](https://owasp.org/API-Security/).
- [Stripe Docs](https://docs.stripe.com/) — patrones de marketplaces.
- [MercadoPago Developers](https://www.mercadopago.com/developers/) — webhooks LATAM.

Consulta: 2026-07-19.
