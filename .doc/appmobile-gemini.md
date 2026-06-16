# Comparativa Funcional: Frontend vs App Mobile

## Resumen del Estado Actual

Tras realizar un análisis de las carpetas `frontend/` y `appmobile/`, se constata la siguiente situación general:

- **Frontend (`@frontend`)**: Es la aplicación web principal desarrollada en Next.js. Posee tanto el diseño completo como **toda la lógica de negocio y funcionalidades implementadas**. Incluye integraciones complejas como pasarelas de pago (Stripe, MercadoPago), mapas (Leaflet), chat en tiempo real (Socket.io), panel de administración, analíticas y funciones basadas en IA (Gemini).
- **App Mobile (`@appmobile`)**: Es la aplicación móvil desarrollada con Expo y React Native (NativeWind). Actualmente, **tiene implementado el diseño UI/UX (pantallas y componentes visuales)**, pero a nivel funcional **solo cuenta con la autenticación (Login) habilitada**. El resto de los módulos son meramente visuales y no están conectados al backend ni manejan lógica de negocio real.

---

## Desglose Funcional por Módulos

A continuación, se detalla el estado de las principales funcionalidades en ambas plataformas:

| Funcionalidad / Módulo | Estado en Frontend | Estado en App Mobile | Observaciones |
| :--- | :---: | :---: | :--- |
| **Autenticación (Auth)** | ✅ Completo | ✅ Funcional | El registro, inicio de sesión y manejo de sesión están operativos en ambas partes. |
| **Inicio y Categorías (Home / Categories)** | ✅ Completo | 🎨 Solo UI | La app móvil muestra las interfaces (tarjetas, listas), pero falta integrar la carga dinámica de datos reales desde el backend (`fetch` / `queries`). |
| **Servicios (Services)** | ✅ Completo | 🎨 Solo UI | En *Frontend* hay un flujo completo: matchmaking, gestión de leads, cotizaciones (quotes) y sistema escrow. En *Mobile* solo existen las vistas. |
| **Pagos (Payments)** | ✅ Completo | ❌ No Implementado | *Frontend* integra Stripe y MercadoPago. *Mobile* carece de configuración y SDKs nativos para procesar pagos de servicios o suscripciones. |
| **Mensajería (Chat / Messages)** | ✅ Completo | 🎨 Solo UI | La app móvil tiene la interfaz diseñada e incluye la dependencia `socket.io-client`, pero carece de la lógica para enviar/recibir mensajes y mantener el estado en tiempo real. |
| **Geolocalización (Geo / Maps)** | ✅ Completo | 🎨 Solo UI | *Frontend* usa Leaflet para ubicar servicios en mapas. *Mobile* tiene `expo-location` instalado pero no implementa los mapas interactivos o filtros de distancia. |
| **Favoritos (Favorites)** | ✅ Completo | 🎨 Solo UI | Los botones de "Favoritos" en la app móvil no persisten la acción en base de datos. |
| **Perfil (Profile / Users)** | ✅ Completo | 🎨 Solo UI | Actualización de información, preferencias y carga de avatares están pendientes de integrarse con el backend en la app. |
| **Reservas (Bookings)** | ✅ Completo | 🎨 Solo UI | Faltan las validaciones y el envío del formulario de reserva en la app móvil. |
| **Panel de Administración (Admin)** | ✅ Completo | ❌ No Aplica | Funcionalidad exclusiva para entorno web. |
| **Analíticas y Dashboard** | ✅ Completo | ❌ No Implementado | Tableros de métricas para proveedores (usando `recharts` en web). |
| **Chatbot / IA (Gemini AI)** | ✅ Completo | ❌ No Implementado | El Frontend integra bots asistenciales con la API de Google GenAI. |
| **Internacionalización (i18n)** | No requiere | 🏗️ En proceso | Mobile cuenta con estructura básica para multi-idioma (`i18n-js`), aunque las traducciones pueden no estar al 100%. |

---

## Diferencias a Nivel Técnico

1. **Gestión del Estado y Peticiones (Data Fetching):**
   - **Frontend** emplea Server Actions de Next.js, caché y SWR/React Query integrados profundamente con Prisma u ORMs.
   - **App Mobile** cuenta con `@tanstack/react-query` pre-instalado, el cual es ideal para comenzar a conectar las vistas con los endpoints REST/GraphQL, pero hoy por hoy las `actions` (ej: `/appmobile/src/features/services/actions/`) están vacías o son *mocks*.

2. **Dependencias Críticas Ausentes en Mobile:**
   - No existen librerías nativas para procesar tarjetas (Stripe React Native).
   - No hay lógicas configuradas de deep linking avanzado, push notifications o integraciones de cámara para subir archivos o evidencias de los servicios prestados.

---

## Próximos Pasos (Roadmap sugerido para App Mobile)

Para reducir la brecha entre el diseño existente de la app móvil y su funcionalidad real, se recomienda priorizar las siguientes acciones:

1. **Conexión de APIs con React Query**: Interconectar el catálogo del "Home" y "Categorías" con el backend.
2. **Flujo de Usuario Básico (Favoritos y Perfil)**: Habilitar las mutaciones para guardar favoritos y editar perfiles.
3. **Flujo de Servicios**: Empezar a adaptar los actions de cotizaciones (`quotes`), leads y reservas desde el frontend hacia el entorno móvil.
4. **Chat Integrado**: Dar vida al módulo de mensajería con la instancia de `socket.io-client`.
5. **Pagos In-App**: Incorporar e integrar la pasarela de pagos para concretar el flujo comercial en el teléfono móvil.
