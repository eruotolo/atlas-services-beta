# Plan de Implementación: Mejoras de Mayo (Atlas Services)

Este plan detalla la estrategia técnica para ejecutar las tareas descritas en el plan de mejoras, dividiendo el trabajo en estabilización de la migración Multi-País, refactorización de deuda técnica y desarrollo de nuevas features de crecimiento e Inteligencia Artificial.

## Open Questions

Antes de comenzar la ejecución, me gustaría que aclaremos estos puntos sobre las nuevas ideas:
> [!IMPORTANT]
> 1. **Chatbot con IA**: ¿Qué proveedor de IA prefieres que usemos (Gemini, OpenAI, Claude)? ¿Queremos que el bot funcione totalmente en el cliente o que envíe los mensajes a un nuevo endpoint en NestJS?
> 2. **Integración WhatsApp**: ¿Te refieres a un botón flotante que envíe un mensaje pre-armado a un número de atención de la empresa, o a una integración mediante API oficial (como Twilio / Meta API) para automatizar la solicitud?
> 3. **Pagos por País**: Para apagar los pagos en países como Uruguay, ¿te parece bien que agreguemos un campo booleano `paymentsEnabled` en la tabla de `Country` en la base de datos para controlarlo desde el Admin?
> 4. **Nuevas verticales (Lawnstarter / Care.com)**: ¿Estas ideas se traducen simplemente en agregar estas nuevas categorías y oficios a nuestros scripts de "Seed" (base de datos inicial), o requieren algún flujo de contratación especial?

---

## Proposed Changes

### 1. Backend: Resolución de Bugs Críticos Multi-País
Vamos a estabilizar la lógica geográfica y de pagos en el servidor.

#### [MODIFY] `backend/src/common/guards/country-admin.guard.ts`
- Corregir el parseo del claim `adminCountries` en el JWT.

#### [MODIFY] `backend/src/modules/subscriptions/subscriptions.service.ts`
- Modificar el servicio para que tome el precio filtrando por el `countryId` del usuario actual.

#### [MODIFY] `backend/prisma/seed/prices/index.ts`
- Agregar la lógica de inserción de precios base y premium para ARS, UYU, EUR y USD.

#### [MODIFY] `backend/src/modules/categories/categories.service.ts` & `sponsors.service.ts`
- Agregar el filtro `countryCode` en las consultas de Prisma para evitar fugas de datos de otros países.

---

### 2. Frontend: Estabilización y Multi-País
Removeremos los vestigios del ORM acoplado y la data estática "hardcodeada".

#### [MODIFY] `Server Actions (Varias)`
- Buscar y reemplazar usos antiguos de `revalidateTag` por `revalidatePath` para asegurar el correcto refresco de la caché de Next.js 16.

#### [MODIFY] `Vistas de Perfil y Paso2TuOficio`
- Actualizar el tipado para que consuma los DTOs que devuelve NestJS (ej. leyendo `user.phone` en vez del esquema de Prisma).

#### [MODIFY] `frontend/src/app/admin/`
- Reemplazar funciones de agrupación locales (`prisma.interaccion.groupBy()`) por consumos de nuevos endpoints analíticos en NestJS.

#### [MODIFY] `Componentes de UI y Navegación`
- **Home y Footer**: Remover textos estáticos ("Chiloé", "Ancud") e inyectar el nombre del país y región usando el Contexto de País actual.
- **Formularios**: Reemplazar listas quemadas como `COMUNAS_CHILOE` por el nuevo componente `LocalitySelect`.
- **Enrutamiento**: Implementar el helper `useCountryLink` en todos los botones de navegación interna.

---

### 3. Nuevas Features de Crecimiento (Growth & AI)

#### [NEW] Geolocalización Automática
- Implementaremos detección de ubicación por IP o mediante la API del navegador en el Frontend para redirigir automáticamente al país correcto y pre-filtrar los servicios locales al entrar a la app.

#### [NEW] Chatbot de IA para Matching
- Construiremos un componente de chat en el Frontend conectado a un modelo de lenguaje (LLM).
- El sistema analizará el problema del usuario ("se rompió el calefón"), extraerá la intención y automáticamente le sugerirá la categoría correcta ("Fontanería/Gas") y los profesionales mejor calificados en su zona de geolocalización.

#### [NEW] Verticales de Cuidado y Hogar (Seed Data)
- Actualizaremos los archivos de seed del backend para insertar toda una nueva rama de categorías basándonos en modelos tipo Care.com (Cuidado de adultos mayores, niñeras, enfermería) y Lawnstarter (Paisajismo, jardinería, piscinas).

#### [MODIFY] Pagos por País (Dashboard Admin)
- Modificaremos la tabla de Países en la BD y el panel de administrador para permitir "Apagar" los planes de suscripción para países en fase de crecimiento de adopción (ej. Uruguay).
- Si el país tiene los pagos apagados, la interfaz ocultará todo el flujo de cobro y pasarelas, dejando la app 100% gratuita.

#### [NEW] Integración de WhatsApp
- Agregaremos un canal directo a la UI donde el cliente pueda derivar su búsqueda o solicitud de servicio directo a WhatsApp, adjuntando la data del profesional y su problema mapeado.

---

### 4. Infraestructura y Testing

#### [MODIFY] `setup-test-users.ts`
- Reescribir el script para que interactúe puramente por API HTTP contra el backend, removiendo la dependencia de `bcrypt` en el entorno de testing E2E.

---

## Verification Plan

### Automated Tests
- Ejecutar `pnpm test:e2e` y verificar que los tests Playwright (flujos de login, invitado, admin y multi-país) pasen exitosamente sin fallos de setup de usuarios.

### Build Verification
- Correr `pnpm build` en la carpeta frontend. La compilación estática de páginas y Server Components no debe arrojar errores "500 - Base de datos".

### Manual Verification
- Comprobar que en la ruta raíz se detecte automáticamente la geolocalización.
- Probar el nuevo Chatbot de IA ingresando una solicitud casual (ej. "tengo una fuga de agua") y verificar que recomiende plomeros cercanos.
- En el admin, apagar los pagos para "Uruguay" y verificar como cliente en `/uy/` que no aparezcan muros de pago al registrar un profesional.
