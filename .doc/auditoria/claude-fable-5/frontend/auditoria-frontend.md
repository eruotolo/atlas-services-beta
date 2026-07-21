# Auditoría Frontend

**Stack:** Next.js 16.1.1, React 19.2, App Router, TypeScript strict, Tailwind v4, next-auth v4, React Compiler, Biome + Prettier. 325 archivos TS/TSX. Build ✅, typecheck ✅, lint ✅ (69 warnings).

## Arquitectura
- **DDD por `features/`** con carpeta propia por componente (regla del proyecto, bien aplicada). `shared/` para reutilizables, `lib/` para infra (apiClient, providers).
- **Server Components por defecto + Server Actions** para mutaciones (correcto según guías del proyecto).
- **Multi-país** vía `proxy.ts` (renombrado de middleware en Next 16) con detección por cookie/header/idioma. Rutas activas `(country)/[country]/...`, legacy con redirect a `/cl`.
- **Escalabilidad de la estructura:** buena. La organización por dominio soporta crecimiento de features.

## Calidad
- **Positivo:** `apiClient` con reintentos solo para errores transitorios (no 4xx), manejo de 204/empty body, tags de revalidación. next-auth refresca el token del backend en el callback `jwt` con margen de expiración.
- **A mejorar:** 69 warnings de Biome (usos de `any`), `console.*` como logging. `procesarPagoWebhook` es un stub (`console.info`).

## Rendimiento
- **React Compiler** habilitado (optimiza memoización). Turbopack configurado.
- **next/image** con formatos AVIF/WebP y `remotePatterns` correctos (Cloudinary, Vercel Blob, googleusercontent).
- **No medido en runtime:** Core Web Vitals (LCP/CLS/INP) requieren entorno real (ver información-faltante #10). El uso de Server Components y `next/image` es una base favorable.
- **Leaflet/react-leaflet** y **recharts** son pesados: verificar que estén en islas cliente con carga diferida.

## Accesibilidad
- No evaluada dinámicamente. Uso de Radix UI (checkbox, dialog, dropdown) aporta accesibilidad de base (focus, ARIA, teclado). Recomendado: auditoría axe/Lighthouse en preview.

## Seguridad (frontend)
- **FE-07 (Alta):** `/api/revalidate` sin auth.
- **FE-10 (Media):** webhook MP del frontend sin validar firma.
- **TR-02 (Alta):** Next 16.1.1 vulnerable.
- **TR-15 (Media):** `.env.example` con `NEXT_PUBLIC_API_KEY`.
- **Positivo:** `apiClient` NO expone `API_KEY` al browser (`typeof window === 'undefined'`). Upload verifica sesión antes de proxear a Cloudinary. `redirect` callback de next-auth valida same-origin.
- **Falta:** Content-Security-Policy explícita para las páginas.

## UX
- Wizard de publicación multi-paso, estados de búsqueda con filtros geo dinámicos, panel admin scoped por país. Textos genéricos (no hardcodeados a un país), acorde a las guías.
- **Riesgo:** el flujo de pago no se completa (stub) → mala experiencia al comprar premium.

## Recomendaciones priorizadas
1. Upgrade Next 16.2.6 (TR-02).
2. Autenticar revalidate (FE-07) y retirar webhooks duplicados (FE-10).
3. Medir Core Web Vitals en preview; diferir Leaflet/recharts.
4. Añadir CSP.
5. Reducir `any` incrementalmente.
