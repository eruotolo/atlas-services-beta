# Changelog Semanal - Atlas Services (Junio 2026)

Este documento resume los desarrollos realizados desde los últimos commits formales hasta los cambios no "staged" de hoy. Se centra en la consolidación de la arquitectura Multi-País, la comunicación interactiva y la gestión del perfil del usuario.

## 1. Sistema de Chat Directo (Cliente-Profesional)
- **Floating Chat Widget:** Se desarrolló e integró `FloatingChatWidget.tsx` junto con un event bus (`chatWidgetBus.ts`) para abrir conversaciones globales sin salir del contexto de la pantalla.
- **Integración en Detail Page:** Se modificó `ServiceBookingCard.tsx` para que el botón "Mensaje" dispare inmediatamente el chat interactivo con el profesional en vez de redirigir a una página nueva.
- **Chatbot Inteligente (IA):** Se añadió lógica en `ChatbotWidget.tsx` para ocultarse automáticamente en rutas de `/search` y `/service`, dándole prioridad a la ventana de chat humano.

## 2. Gestión de "Mis Servicios" (Panel de Profesional)
- **Nuevo Panel de Control:** Se creó la ruta `/[country]/profile/services/page.tsx` para listar todos los servicios publicados por el usuario activo.
- **UI Autónoma:** Se construyó `MyServiceItem.tsx`, un componente nativo de lista que permite visualizar el estado del servicio (Pro o Estándar) y botones de acción rápida para Editar y Eliminar (integrado con `apiClient.delete`).
- **Sidebar Actualizado:** El `UserSidebar.tsx` fue actualizado para incorporar la navegación hacia "Mis servicios".

## 3. Direcciones y Geolocalización
- **Base de Datos:** Se actualizó `schema.prisma` incluyendo un modelo relacional dedicado a direcciones (`Address`).
- **APIs Backend:** Nuevos endpoints integrados en `UsersController` para CRUD completo de direcciones de un usuario.
- **Frontend Panel:** Creación de la sub-sección de direcciones (`MyAddresses.tsx`, `MapPicker.tsx` y `AddressForm.tsx`) para la gestión visual en el mapa de las ubicaciones del usuario.

## 4. Refactorización y Estandarización de Rutas (Inglés)
- Las subrutas internas del panel de control (`/perfil/...`) pasaron de español a una nomenclatura estandarizada en inglés para mayor consistencia de código:
  - `/mensajes` → `/messages`
  - `/ajustes` → `/settings`
  - `/cotizaciones` → `/quotes`
  - `/favoritos` → `/favorites`
  - `/verificacion` → `/verification`

## 5. Evolución del Seeder (Testing de UX Multi-País)
- **`test-data.ts`:** El seeder ahora es dinámico y consciente del idioma y la estética.
  - Para United States (`us`), genera títulos y descripciones en **Inglés**.
  - Asigna automáticamente una **galería de imágenes de alta calidad de Unsplash** a cada servicio por categoría para validar el diseño visual realista del frontend.
  - Genera avatares profesionales amigables para los proveedores de prueba.

## 6. Limpieza de Deuda Técnica y Documentación
- Se eliminaron masivamente todos los documentos obsoletos de `/doc` (`analisis-junio.md`, `plan-mayo-mejoras.md`, `plan-refactor-css.md`) para reflejar que la transición a Tailwind v4 y las arquitecturas planteadas en Mayo/Junio ya están asimiladas o implementadas en el código vivo.
