# Comparativa Funcional: frontend/ vs appmobile/

> Fecha: 2026-06-16  
> Generado por: Claude Code — análisis directo de código fuente  
> Stack mobile: Expo SDK 54, React Native 0.81.5, expo-router 6, NativeWind v4, TanStack Query

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado y conectado al backend real |
| ⚠️ | UI presente pero sin lógica / placeholder / Alert vacío |
| ❌ | No existe en mobile |
| N/A | No aplica en mobile (admin, SEO, etc.) |

---

## 1. AUTENTICACIÓN

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Login email/password | ✅ | ✅ (`/auth/login` → JWT + SecureStore) |
| Register | ✅ | ✅ (`/auth/register` → JWT + SecureStore) |
| Refresh token automático | ✅ | ✅ (interceptor en `apiClient`) |
| Logout | ✅ | ✅ (limpia SecureStore + context) |
| Google OAuth | ✅ | ⚠️ Botón UI, sin implementar |
| Apple OAuth | ❌ | ⚠️ Botón UI, sin implementar |
| Microsoft OAuth | ❌ | ⚠️ Botón UI, sin implementar |
| Forgot password | ✅ | ⚠️ Link UI, sin implementar |
| Onboarding post-registro | ❌ | ⚠️ Pantalla existe (`/onboarding`) pero no está conectada al flujo de registro |
| Auth Gate (modal login) | ✅ | ✅ (`RegisterGateSheet` + `useAuthGate`) |

---

## 2. HOME

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Categorías desde API | ✅ | ✅ |
| Servicios destacados (carousel) | ✅ | ✅ |
| Barra de búsqueda | ✅ | ✅ (navega a tab Services con query) |
| Selector de país | ✅ (cookie/redirect) | ✅ (`CountrySelectorSheet`) |
| Geolocalización / location pill | ❌ | ✅ (`useGeolocation` hook) |
| Banner reserva activa en curso | ❌ | ✅ (`ActiveBookingBanner` — filtra IN_PROGRESS) |
| Badge mensajes no leídos | ✅ | ✅ (dot en ícono bell) |
| Saludo personalizado (auth/guest) | ✅ | ✅ (i18n) |
| Sección "¿Cómo funciona?" | ✅ | ❌ |
| Sección Stats / números | ✅ | ❌ |
| CTA final (publicar) | ✅ | ❌ |
| Sección de precios | ✅ | ❌ |

---

## 3. BUSCAR / LISTADO DE SERVICIOS

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Listado desde API | ✅ | ✅ |
| Paginación | ✅ | ✅ (infinite scroll con `useInfiniteQuery`) |
| Filtro por categoría | ✅ | ✅ (chips horizontales) |
| Búsqueda por texto | ✅ | ✅ |
| Filtro geo (región / localidad) | ✅ | ✅ (`FilterSheet` con API geo dinámica) |
| Favoritos (toggle) | ✅ | ✅ (optimistic update) |
| Badge servicios Top Pro / Destacado | ✅ | ✅ (`isTopPro` → nivel FEATURED) |
| Sponsor banner | ✅ | ❌ |
| Resultados vacíos / error state | ✅ | ✅ |

---

## 4. DETALLE DE SERVICIO

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Galería de imágenes | ✅ | ✅ (`ServiceGallery` swipeable) |
| Info proveedor (avatar, nombre, rating) | ✅ | ✅ |
| Precio base | ✅ | ✅ (formateado por moneda del país) |
| Descripción | ✅ | ✅ |
| Tabla de tiers de precio (BASIC/PREMIUM/FEATURED) | ✅ | ❌ |
| Categoría y ubicación | ✅ | ✅ |
| Redes sociales del proveedor | ✅ | ✅ (badges, sin abrir URL aún) |
| Reseñas — listado (primeras 3) | ✅ | ✅ |
| Reseñas — "ver todas" | ✅ | ⚠️ Pressable sin acción |
| Escribir reseña | ✅ | ❌ |
| Owner reply en reseñas | ✅ | ❌ |
| Servicios relacionados | ✅ | ❌ |
| Botón Contratar → crea conversación | ✅ | ✅ (POST `/chat/conversations` → navega al chat) |
| Botón Compartir | ✅ | ⚠️ Botón UI, sin acción |
| Favorito toggle (optimistic) | ✅ | ✅ |
| Detección de "soy el dueño" (oculta CTA) | ✅ | ✅ |
| Formulario de solicitud de servicio (lead) | ✅ | ❌ (solo abre chat directo) |

---

## 5. MENSAJES / CHAT P2P

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Lista de conversaciones | ✅ | ✅ |
| Filtro / búsqueda de conversaciones | ❌ | ✅ |
| Chat en tiempo real (WebSocket) | ✅ | ✅ (Socket.IO via `SocketContext`) |
| Historial de mensajes | ✅ | ✅ |
| Indicador de escritura (typing) | ✅ | ✅ |
| Presencia online/offline | ✅ | ✅ |
| Mark as read automático | ✅ | ✅ |
| Badge de no leídos global | ✅ | ✅ |
| Iniciar conversación desde detalle | ✅ | ✅ |
| Adjuntar archivos / imágenes | ❌ | ❌ |

---

## 6. RESERVAS / BOOKINGS (Service Requests)

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Lista de solicitudes enviadas | ✅ | ✅ |
| Filtro upcoming / past | ✅ | ✅ |
| Ver estado de reserva | ✅ | ✅ |
| Acciones: Reprogramar | ✅ | ⚠️ `Alert.alert` placeholder |
| Acciones: Ver detalles | ✅ | ⚠️ `Alert.alert` placeholder |
| Acciones: Ver recibo | ✅ | ⚠️ `Alert.alert` placeholder |
| Acciones: Volver a reservar | ✅ | ⚠️ `Alert.alert` placeholder |
| Navegar al servicio de la reserva | ✅ | ❌ (tiene `serviceSlug` en tipo pero no navega) |

---

## 7. PERFIL DE USUARIO

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Ver perfil (avatar, nombre, rol) | ✅ | ✅ |
| Editar perfil (nombre, teléfono) | ✅ | ✅ (PATCH `/users/me`) |
| Cambiar contraseña | ✅ | ✅ (POST `/auth/change-password`) |
| Subir avatar / foto de perfil | ✅ | ❌ |
| Direcciones — ver lista | ✅ | ✅ (GET `/users/me/addresses`) |
| Direcciones — agregar | ✅ | ⚠️ Botón "+" sin implementar |
| Direcciones — editar / eliminar | ✅ | ❌ |
| Favoritos — lista horizontal | ✅ | ✅ |
| Favoritos — "ver todos" | ✅ | ⚠️ Pressable sin acción |
| Mis Servicios (proveedor) | ✅ | ❌ |
| Leads recibidos | ✅ | ❌ |
| Cotizaciones / Quotes | ✅ | ❌ |
| Verificación KYC | ✅ | ❌ |
| Configuración / Settings | ✅ | ⚠️ Menú row vacío |
| Soporte | ❌ | ⚠️ Menú row vacío |
| Pagos / historial | ✅ | ⚠️ Menú row vacío |
| Switch rol Cliente ↔ Proveedor | ✅ | ✅ |
| Logout con confirmación | ✅ | ✅ |

---

## 8. PUBLICAR SERVICIO (Provider)

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Wizard multi-paso | ✅ (Paso1-Paso6) | ❌ — No existe en mobile |
| Upload de imágenes / galería | ✅ | ❌ |
| Selección de categorías | ✅ | ❌ |
| Configurar precios por nivel | ✅ | ❌ |
| Editar servicio existente | ✅ | ❌ |
| Desactivar / eliminar servicio | ✅ | ❌ |

---

## 9. PAGOS

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| MercadoPago (CL/AR/UY) | ✅ | ❌ |
| Stripe (ES/US) | ✅ | ❌ |
| Flujo de cotización → pago | ✅ | ❌ |
| Historial de pagos | ✅ | ⚠️ Menú row vacío |

---

## 10. NOTIFICACIONES

| Funcionalidad | Frontend | Mobile |
|--------------|----------|--------|
| Badge conteo no leídos | ✅ | ✅ (dato real de API) |
| Pantalla / drawer de notificaciones | ❌ | ❌ (bell sin acción) |
| Notificaciones push (Expo) | ❌ | ❌ |
| In-app banner (componente existe) | N/A | ⚠️ Componente `InAppNotificationBanner` existe pero no está montado en ningún layout |

---

## 11. FUNCIONALIDADES SOLO-WEB (no aplican en mobile)

| Funcionalidad | Razón |
|--------------|-------|
| Panel Admin | Solo SuperAdmin, desktop-first |
| Dashboard analytics | Admin only |
| Gestión de sponsors | Admin only |
| Configuración de países | Admin only |
| Precios premium (admin) | Admin only |
| SEO / meta tags | Web only |
| Páginas estáticas (about, terms, privacy, help, how-it-works, contact) | Podría aplica, no implementado |
| Chatbot IA | No implementado en mobile |
| Design System | Web only |

---

## 12. RESUMEN EJECUTIVO

### Lo que mobile tiene y funciona
- Flujo completo de cliente: buscar → filtrar → ver detalle → contratar (chat) → gestionar reservas
- Autenticación JWT real con refresh automático y persistencia en SecureStore  
- Chat P2P en tiempo real con Socket.IO (typing, presence, mark-as-read)
- Favoritos completamente funcionales (add/remove con optimistic update)
- Filtro geo dinámico (región + localidad desde API)
- Multi-país (selector de país + moneda + i18n)
- Edición de perfil y cambio de contraseña

### Lo que mobile tiene pero incompleto (stub)
- Acciones sobre reservas (reschedule, receipt, rebook) — solo Alert.alert
- Botones de OAuth (Google/Apple/Microsoft) — sin implementar
- Notificaciones — badge real pero sin pantalla
- Addresses — solo lectura, no se puede agregar ni editar
- Soporte, Settings, Pagos — menú rows vacíos

### Lo que falta completamente en mobile vs frontend
1. **Publicar / editar servicio** — el flow más crítico para proveedores
2. **Mis Servicios** (gestión como proveedor)
3. **Leads** — solicitudes recibidas por el proveedor
4. **Cotizaciones / Quotes** — flujo post-lead
5. **Pagos** — MercadoPago / Stripe
6. **Escribir reseñas** — solo se pueden leer
7. **KYC / Verificación** de identidad
8. **Subir avatar**
9. **Notificaciones push** (Expo Notifications)
10. **Chatbot IA**
11. **Páginas estáticas** (términos, privacidad, ayuda, cómo funciona, contacto)
12. **Forgot password** flow completo
13. **OAuth** real (Google como mínimo)
14. **In-app notification banner** — componente existe pero no se usa
15. **Tiers de precio** en detalle de servicio

---

## 13. DEUDA TÉCNICA INTERNA (mobile)

| Problema | Archivo | Detalle |
|---------|---------|---------|
| `countryCode` hardcoded vacío | `services/actions/queries.ts:45` | `adaptItem` asigna `countryCode: ''` — backend no lo devuelve en el item |
| Social links en detail no abren URL | `service/[slug].tsx:235` | Muestra tipo pero no hace `Linking.openURL` |
| Onboarding desconectado | `(auth)/onboarding.tsx` | Pantalla existe pero no está en el flujo de registro |
| `InAppNotificationBanner` huérfano | `features/messages/components/InAppNotificationBanner` | Componente creado, no montado en ningún layout |
| Bookings actions sin lógica real | `(tabs)/bookings.tsx:31-32` | Todas las acciones llaman `showAlert` — falta API |
| Addresses sin CRUD | `profile/addresses.tsx` | Solo GET, botón "+" sin `onPress` |

---

*Documento generado el 2026-06-16. Actualizar tras cada sprint de appmobile.*
