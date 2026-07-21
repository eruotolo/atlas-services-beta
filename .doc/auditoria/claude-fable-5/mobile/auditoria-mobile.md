# Auditoría Mobile

**Stack:** Expo SDK 54, React Native 0.81.5, expo-router 6, NativeWind v4 (Tailwind v3 interno), React Query 5, expo-secure-store, i18n-js, socket.io-client. 98 archivos TS/TSX. Typecheck ✅, lint ❌ (7 err/31 warn).

## Arquitectura
- **DDD por `features/`** con carpeta por componente (consistente con web). Navegación expo-router con grupos `(auth)`, `(tabs)`, y stacks (chat, profile, publish, service, notifications).
- **React Query** para data fetching/caché (correcto para mobile). Contextos por dominio (Auth, AuthGate, Country, i18n, messages).
- **apiClient** con refresh coordinado por cola (evita refresh múltiple concurrente) — buen diseño.
- **NativeWind v4** con `className`; tokens de color en `shared/constants/colors.ts` (fuente de verdad) replicados en `tailwind.config.js`.

## Compatibilidad
- **Permisos** declarados con textos en `app.json` (ubicación foreground-only, cámara, fotos, notificaciones). Correcto.
- **Deep links:** scheme `appmobile` (genérico; conviene alinear con `hireeo`).
- **EAS** configurado (dev/preview/production) con URLs por entorno. `autoIncrement` en producción.
- **Sin bloque `ios`/`android`** explícito en `app.json` (bundle identifier, versionCode) — necesario antes de publicar en tiendas.
- **New Architecture:** Expo 54 la usa; el upgrade a SDK 55+ la vuelve obligatoria (planificar).

## Seguridad
- **MO-06 (Alta):** mobile **no envía `x-api-key`** → los endpoints protegidos por el ApiKeyGuard global responden 401; solo funcionan los `@Public`. Además `EXPO_PUBLIC_API_KEY` en el ejemplo es un antipatrón (incrustar la key en el binario).
- **Positivo:** tokens en `expo-secure-store` en nativo; `localStorage` solo en fallback web.
- **A revisar:** capturas de pantalla de datos sensibles, clipboard, certificate pinning (según riesgo de negocio; no crítico ahora).

## Rendimiento
- No evaluado en dispositivo. `expo-image` (buen caché de imágenes), React Query (deduplicación). Verificar listas grandes (FlatList/virtualización) en búsqueda y chat.

## Integración
- **MO-11 (Media):** `authService.forgotPassword` llama a `/auth/forgot-password`, inexistente en backend → 404.
- **Contrato:** tipos redefinidos localmente (`features/*/types`), sin generación desde OpenAPI → riesgo de deriva con el backend.
- **socket.io-client** presente para chat; depende de que el backend tenga WebSocket estable (hoy comprometido por serverless, BE-04).

## UX
- i18n con `i18n-js` + `expo-localization` (multi-idioma real). Selector de país en signup (commit reciente). Banners de notificación in-app, indicador de escritura, bottom sheets. Buena base de UX móvil.

## Recomendaciones priorizadas
1. Resolver el modelo de auth (MO-06) — bloquea el uso real de la app.
2. Implementar/ocultar forgot-password (MO-11).
3. Añadir bloque `ios`/`android` con bundle IDs antes de tiendas; alinear scheme de deep link.
4. Planificar upgrade Expo 56 (cierra criticals de tooling; New Architecture ya activa).
5. Consumir contrato OpenAPI compartido.
6. Resolver 7 errores de lint.
