# Roadmap de Consolidación y Crecimiento: Hireeo (Junio 2026)
**Origen:** Merge estricto de `analisis-claude-junio.md` (Auditoría Forense) y `analisis-gemini-junio.md` (UX y Estrategia).

Este documento unifica todos los descubrimientos y establece un **Plan de Ejecución Paralela para IAs**. El objetivo es ejecutar los cambios lo más rápido posible usando a **Claude Code** y **Gemini 3.1** de forma simultánea, sin colisiones de código ni conflictos de git.

Para lograr esto, dividiremos el trabajo estrictamente por arquitectura: **Gemini tomará el Backend y la Base de Datos, y Claude Code tomará el Frontend.**

---

## 🏛️ LA ARQUITECTURA DEL MERGE (El Plan de Acción)

### 1. Extirpación de Mentiras y Bugs (Control de Daños)
*   **Problema:** Badges de seguridad falsos, UI de reservas simuladas y webhooks de pago abiertos a ataques.
*   **Solución unificada:** Eliminar el humo del frontend de inmediato y sanear las pasarelas en el backend.

### 2. Pivote de "Directorio" a "Marketplace" (El Core)
*   **Problema:** La búsqueda estática produce fatiga y se pierden los datos del usuario.
*   **Solución unificada:** Reemplazar el buscador por un **Project Wizard** conversacional (React) y conectar esto a un nuevo modelo en Prisma (`ServiceRequest` y `Quote`) para retener la transacción.

### 3. Confianza y Retención (Lock-in)
*   **Problema:** Si solo conectas teléfonos, el cliente se fuga a WhatsApp.
*   **Solución unificada:** Cobro in-app, retención de fondos (Escrow) y un mini-CRM para que el profesional mande cotizaciones estructuradas dentro del chat de Hireeo.

---

## 🤖 DIVISIÓN ESTRICTA DE TAREAS (Ejecución Simultánea)

Para trabajar hoy mismo y no pisarnos los archivos, esta es la delegación estricta de funciones. 

### 🟢 TAREAS PARA GEMINI 3.1 (Liderazgo de BACKEND y PRISMA)
*Yo (Gemini) operaré exclusivamente dentro de la carpeta `/backend` y el archivo `schema.prisma`. No tocaré componentes de React.*

1.  **Seguridad de Pagos (Hotfix):**
    *   **Archivos:** `backend/src/modules/payments/mercadopago.gateway.ts`, `stripe.gateway.ts`.
    *   **Acción:** Eliminar los stubs (`isValid: true`) e implementar la validación criptográfica estricta de los webhooks usando los SDKs correspondientes.
2.  **Modelado Transaccional (Prisma):**
    *   **Archivos:** `backend/prisma/schema.prisma`.
    *   **Acción:** Eliminar la dependencia tóxica de la suscripción creando los modelos `ServiceRequest` (brief del cliente) y `Quote` (oferta del profesional) con la máquina de estados enum (`PENDING`, `QUOTED`, `ACCEPTED`). Ejecutar la migración.
3.  **Endpoints del Marketplace:**
    *   **Archivos:** `backend/src/modules/services/` y `backend/src/modules/quotes/` (nuevo).
    *   **Acción:** Crear la API REST para que el frontend pueda enviar los datos del nuevo *Project Wizard* y permitir a los pros enviar cotizaciones.

### 🟣 TAREAS PARA CLAUDE CODE (Liderazgo de FRONTEND NEXT.JS)
*Claude Code operará exclusivamente dentro de la carpeta `/frontend`. Deberás darle la orden en tu terminal para que empiece con esto.*

1.  **Limpieza de UI Engañosa (Hotfix):**
    *   **Archivos:** `frontend/src/.../ServiceTrustCard.tsx`, `ServiceBookingCard.tsx`.
    *   **Acción:** Eliminar o comentar los badges de "Identidad Verificada" y "Background Check" hardcodeados. Eliminar el input falso de reserva y dejar un botón limpio de "Solicitar Cotización".
2.  **Construcción del Project Wizard:**
    *   **Archivos:** `frontend/src/features/services/components/ProjectWizard/` (nuevo), `HeroCategories.tsx`.
    *   **Acción:** Destruir el buscador estático que tiene bugs de ruteo y construir una máquina de estados en React (Wizard) que pregunte: ¿Problema? -> ¿Urgencia? -> ¿Dónde?. 
3.  **Integración con mi Backend:**
    *   **Archivos:** `frontend/src/lib/api/apiClient.ts` y actions.
    *   **Acción:** Consumir los nuevos endpoints de `ServiceRequest` que Gemini estará levantando en el puerto 4000, asegurando que el *brief* capturado por la IA en el home se persista en la base de datos al contactar al pro.

---

## 🚀 CÓMO ARRANCAR AHORA MISMO
Con esta división, ambos podemos codificar ya mismo sin generar conflictos de Git (merge conflicts). 

1.  **Abre tu terminal con Claude Code** y dile: *"Lee el archivo .doc/analisis-junio.md y ejecuta inmediatamente tu fase de Limpieza de UI Engañosa en el Frontend"*.
2.  **Dime a mí (Gemini) en este chat:** *"Empieza con tu tarea de Seguridad de Pagos en el Backend"*. 

¡Aceleremos esto x2!
