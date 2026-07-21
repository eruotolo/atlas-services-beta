# Auditoría Mobile

**Stack**: Expo SDK 54 + React Native 0.81.5 + expo-router 6 + NativeWind v4 + React Query v5.
**Commit**: `fe9b462` (submódulo appmobile).
**Tamaño**: 98 archivos TS/TSX en `src/`.

## Resumen

| Métrica | Resultado |
|---|---|
| Typecheck | ✅ Limpio |
| Lint (`biome check`) | ❌ 7 errors, 31 warnings |
| Tests | ❌ 0 archivos `*.spec.ts`/`*.test.ts` |
| Build nativo | No ejecutado (requiere prebuild/device) |
| Score arquitectura | **5.0/10** (DDD OK, contrato BE roto) |
| Score seguridad | **4.0/10** (SecureStore OK, pero sin x-api-key, sin signing release) |
| Score preparación release | **2.0/10** (5 bloqueantes de release) |

## Arquitectura

### Fortalezas
- **DDD consistente**: `features/<dominio>/{actions,components,context,hooks,lib}` + `shared/` + `types/`.
- **expo-router 6** con tabs, auth, chat, profile, publish, service, notifications.
- **React Query v5** para estado server.
- **`expo-secure-store`** para tokens (0 AsyncStorage).
- **NativeWind v4** bien configurado: babel, metro, tailwind, colors sincronizados.
- **TypeScript strict**.
- **Manejo robusto de refresh** con cola anti-tormenta (`apiClient.ts:27-93`).
- **FlatList** en todas las listas largas.
- **TabBar custom** con auth gate.
- **`useGeolocation`** pide permiso antes de usar GPS.

### Debilidades
- **Contrato backend roto** (MOB-001 a MOB-005, MOB-010).
- **`applicationId` anónimo** `com.anonymous.appmobile` (MOB-005).
- **Signing release = debug keystore** (MOB-004).
- **`SOCKET_URL` hardcodeado** localhost (MOB-002).
- **Push notifications rotas** sin `extra.eas.projectId` (MOB-003).
- **Icon map hardcodeado de 528 líneas** copiado de Tabler Icons (MOB-012) — viola AGENTS.md icons0.
- **`expo-image` instalado pero no usado** (MOB-009).
- **Logout incompleto** (MOB-006, MOB-007, MOB-008).
- **Query keys inconsistentes** (MOB-ARCH-001).
- **Código muerto**: 5 hooks no usados, `src/types/` vacío.
- **Sin `GestureHandlerRootView`** (MOB-011).

## Navegación

- `app/_layout.tsx`: SafeAreaProvider + QueryClientProvider (falta GestureHandlerRootView).
- `(tabs)/`: home, services, bookings, chat, profile.
- `(auth)/`: login, register.
- `chat/[id].tsx`, `service/[slug].tsx`, `publish/index.tsx`, `profile/`, `notifications/`.
- **Sin route guards a nivel navigator** — usa gate por acción (`if (!user) return`).
- **Deep links**: solo scheme custom `appmobile://` (MOB-007: sin Universal Links).
- **Ruta inválida** en `ProveedorCard`: usa path web `/${country}/service/${slug}` (MOB-010).

## Auth

- **SecureStore** correcto.
- **`AuthContext`** con `login`, `logout`, `handleRefresh`.
- **Logout incompleto**: no llama `queryClient.clear()` (MOB-006), no navega al login si refresh falla (MOB-008), no invalida refresh server-side (MOB-007).

## API Client

- `shared/lib/apiClient.ts` (102 líneas).
- **NO envía `x-api-key`** (MOB-001) — **crítico**.
- Sin timeout/AbortController (MOB-PERF-001).
- Cola de refresh correcta.
- `countryCode` inyectado como query param.

## Seguridad mobile

- **SecureStore** ✓ (no AsyncStorage).
- **0 WebView inseguras**.
- **Permisos**: AndroidManifest pide `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` (deprecados), `RECORD_AUDIO` (sin uso), `SYSTEM_ALERT_WINDOW` (inadecuado release) — MOB-SEC-002.
- **Sin pinning** (esperado).
- **Sin obfuscación / App Check** — API_KEY extraíble del bundle.
- **Sin jailbreak/root detection** (no justificado por riesgo negocio hoy).

## Performance

- **FlatList** correcto en listas largas.
- **`Image` de RN** en vez de `expo-image` (MOB-009): sin cache nativo, descargas redundantes.
- **Reanimated** solo en `TypingIndicator`.
- **Sin memoria leaks evidentes** (pero sin tests para confirmar).

## UX

- `publish/index.tsx` sin gate visual de auth (MOB-10 INFO, M10).
- i18n default siempre `es` incluso para usuarios US (MOB-I18N-001).
- `formatCurrency` inconsistente con `formatPrice` (MOB-B6).
- `useEffect` frágiles en Contexts (MOB-B7).

## Compatibilidad

- **Android**: prebuild generado, signing roto.
- **iOS**: **no existe carpeta `ios/`** — no se puede generar build iOS actualmente.
- **Versiones mínimas**: no definidas explícitamente.

## Release readiness

| Ítem | Estado |
|---|---|
| Application ID | ❌ `com.anonymous.appmobile` |
| App name visible | ❌ `appmobile` (debe ser `Hireeo`) |
| Signing release | ❌ debug keystore |
| Icono adaptativo | ❌ no definido en `app.json` |
| Splash | ❌ no definido en `app.json` |
| Push notifications | ❌ sin `extra.eas.projectId` |
| Universal Links | ❌ solo scheme custom |
| iOS build | ❌ no hay `ios/` carpeta |

**Conclusión**: la app **no es publicable** en Play Store ni App Store en su estado actual.

## Recomendaciones priorizadas para mobile

1. **Inmediato**: A04 (x-api-key), B07 (SOCKET_URL + applicationId + ProveedorCard route), B08 (GestureHandlerRootView + expo-image + push projectId).
2. **7 días**: MOB-006/007/008 (logout completo).
3. **30 días**: C11 (signing release Android), MOB-012 (migrar a icons0).
4. **90 días**: iOS native build, App Check / Play Integrity.

## Comandos ejecutados

```bash
cd appmobile
npx tsc --noEmit    # EXIT 0
pnpm lint           # 7 errors, 31 warnings
pnpm audit --prod   # 119 vulns workspace
```
