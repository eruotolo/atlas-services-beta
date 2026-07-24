# 03 — Mapa de entidad legal y roles (Fase 1)

- **Fecha:** 2026-07-23
- **Alcance:** identificación de la entidad operadora y de los roles de usuario/tratamiento, distinguiendo lo confirmado en código de lo supuesto.

---

## 1. Entidad legal

### 1.1 Confirmado (evidencia en repo)

| Elemento | Valor | Evidencia |
|---|---|---|
| Nombre comercial | **Hireeo** | `package.json` (`name: "hireeo"`); `hireeo-system.prompt.ts:2` |
| Dominio | **hireeo.app** | `CLAUDE.md` §5; `frontend/src/app/layout.tsx` (siteConfig.url) |
| Email de contacto público | **info@hireeo.app** | `layout.tsx:156` |
| Año de fundación declarado (schema SEO) | **2025** | `layout.tsx:157` |
| Perfiles sociales referenciados | Twitter / GitHub (siteConfig.links) | `layout.tsx:158` |

### 1.2 NO confirmado (BLOCKING)

- **Razón social, forma jurídica (SpA/SL/LLC/SA/etc.), país de constitución, domicilio fiscal, número de identificación tributaria** → sin evidencia en el repo. Búsqueda negativa registrada en `01-...md` §C.
- **Quién actúa como operador de la plataforma y merchant of record** → indeterminado (ligado a Q2, arquitectura de pagos en *stub*).
- **No hay archivo LICENSE** → titularidad del software no formalizada en repo.

> **Conclusión:** no puede determinarse la(s) entidad(es) legal(es) desde el código. Es el bloqueador #1 para cualquier documento legal (Términos, Política de Privacidad, identificación de responsable/controlador). Debe aportarlo el negocio.

---

## 2. Roles de usuario (confirmado)

Definidos en el enum de backend y creados por el seed:

| Rol (código) | Etiqueta interna | Descripción funcional | Evidencia |
|---|---|---|---|
| `CLIENT` | `Client` | Cliente que busca y contacta servicios; rol por defecto al registrarse | `role.enum.ts:2`; `auth.service.ts:67` |
| `PROVIDER` | `Professional` | Prestador que publica servicios, recibe solicitudes/cotiza; sujeto a KYC | `role.enum.ts:3`; `roles-users/index.ts:45-47` |
| `ADMIN` | `Admin` | Administración operativa scoped por país (`UserRole.countryId`) | `role.enum.ts:4`; `roles-users/index.ts:39-41` |
| `SUPER_ADMIN` | `SuperAdmin` | Administración global; modera reseñas, gestiona integraciones/credenciales | `role.enum.ts:5`; `roles-users/index.ts:33-35` |

- **Multi-rol y multi-país:** un usuario puede tener varios roles y estar asociado a distintos países vía `UserRole{userId, roleId, countryId}` (`schema.prisma:185-201`).
- **`isAdmin()`** trata Admin y SuperAdmin como privilegiados (`role.enum.ts:8-11`).
- **Acceso máquina/API:** el backend exige `x-api-key` global (`ApiKeyGuard`) y hay un `INTERNAL_SERVICE_TOKEN` para que el frontend lea credenciales OAuth (`api-key.guard.ts`; `.env.example:29-31`). Es un "API user" de sistema, no un rol humano.

### 2.1 Roles NO presentes en código (supuesto / ausencia)

- **Moderador dedicado, afiliado, empresa/B2B, visitante como entidad** → no existen como rol. La moderación de reseñas la haría SuperAdmin (inferencia, apoyada en memoria de producto; **verificar**).
- El **visitante anónimo** no es un rol pero sí un titular de datos relevante (analítica web).

---

## 3. Roles de tratamiento de datos (candidatos — NO confirmados)

> El rol de tratamiento (responsable/encargado) es una **cuestión jurídica y de negocio (Q3, BLOCKING)**. La tabla es una hipótesis técnica de partida.

| Tratamiento | Rol candidato de Hireeo | Otras partes | Nota |
|---|---|---|---|
| Cuentas y autenticación | Responsable/Controlador | Proveedores OAuth (corresponsables/independientes) | — |
| Anuncios de servicio | Responsable del listado | Prestador responsable del contenido | Posible corresponsabilidad |
| Mensajería cliente↔prestador | Responsable (aloja) | Usuarios | Comunicaciones privadas |
| Pagos (futuro) | Por definir: agente / MoR / agregador | Stripe / MercadoPago (encargados o independientes) | Depende de Q2 |
| KYC | Responsable del flag; Stripe procesa identidad | Stripe (Identity) | Datos potencialmente sensibles |
| Analítica web (GA4/GTM) | Corresponsable con Google (según criterio AEPD/EDPB) | Google | Sin consentimiento hoy |
| IA (Gemini) | Responsable del tratamiento; Google como encargado/independiente | Google | Entrenamiento no confirmado (Q4) |
| Email/Push | Responsable; Brevo/Firebase encargados | Brevo, Google | Requiere DPA |

---

## 4. Naturaleza de la relación de marketplace (síntesis)

- **Confirmado:** intermediario de **descubrimiento y contacto** (perfiles, búsqueda geo, mensajería, solicitudes/cotizaciones, reseñas).
- **Confirmado (no operativo):** infraestructura de **intermediación de pagos con comisión** (escrow 15%, split payment) en estado *stub/mock* — hoy **no cobra ni retiene fondos reales**.
- **Inferencia técnica:** servicios mayoritariamente **presenciales** (manuales), lo que traslada la ejecución fuera de la plataforma y condiciona responsabilidad, disputas y reembolsos.
- **Clasificación jurídica formal (intermediario / hosting / plataforma en línea / marketplace / MoR):** se difiere a la **Fase 2** (`marketplace/01-platform-role-and-liability-analysis.md`), condicionada a Q1 y Q2.
