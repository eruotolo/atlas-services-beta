# Comparación con otras auditorías

Comparación con las auditorías previas realizadas por otros modelos. **No se modificaron los archivos de otras auditorías**; esta es una lectura crítica independiente.

## Auditorías comparadas

| Modelo | Ruta | Fecha | Commit |
|---|---|---|---|
| **gpt-5** | `.doc/auditoria/gpt-5/2026-07-18_bc57586/` | 2026-07-18 | `bc57586` (mismo) |
| **claude-fable-5** | `.doc/auditoria/claude-fable-5/` | 2026-07-18 | (similar) |
| **AUDITORIA.md raíz** | `.doc/auditoria/AUDITORIA.md` | 2026-07-18 | (frontend + mobile) |
| **glm-5.2 (esta)** | `.doc/auditorias/auditoria-glm/` | 2026-07-19 | `bc57586` (mismo) |

## Coincidencias principales (validadas independientemente por glm-5.2)

Los siguientes hallazgos fueron **confirmados por mi propia lectura del código** y coinciden con gpt-5/claude-fable-5:

| Hallazgo | glm-5.2 | gpt-5 | claude-fable-5 | Notas |
|---|---|---|---|---|
| Mobile no envía `x-api-key` | ✅ MOB-001 | ✅ MOB-002 | ✅ | **Crítico, confirmado por 3 modelos** |
| Socket.IO localhost en mobile | ✅ MOB-002 | ✅ MOB-009 | ✅ | Crítico, confirmado |
| Stripe sin precio server-side | ✅ FE-SEC-007 | ✅ FE-SEC-001 | ✅ | Crítico |
| MercadoPago stubs | ✅ FE-PAY-002 | ✅ FE-PAY-001 | ✅ | Crítico |
| XSS JSON-LD service page | ✅ FE-SEC-003 | ✅ FE-SEC-002 | ✅ | Crítico |
| Refresh token expuesto en session.user | ✅ FE-SEC-008 | ✅ FE-SEC-003 | ✅ | Alto |
| Next.js 16.1.1 vulnerable | ✅ TRANSV-003 | ✅ FE-SEC-004 | ✅ | Alto, 13 CVEs |
| App mobile no lista para producción | ✅ MOB-001-005 | ✅ | ✅ | Crítico |
| 0 tests en backend/mobile | ✅ TRANSV-001 | ✅ | ✅ | Alto |
| Webhooks rotos (Stripe sin API key al BE) | ✅ FE-PAY-001 | ✅ | ✅ | Crítico |

**Confidence boost**: las 3 auditorías independientes (gpt-5, claude-fable-5, glm-5.2) coinciden en los mismos hallazgos críticos. Esto valida fuertemente la existencia real de los problemas.

## Diferencias de severidad

| Hallazgo | glm-5.2 | gpt-5 | Comentario |
|---|---|---|---|
| `/email/send` sin auth | 🔴 Crítica (BE-SEC-003) | No mencionado explícitamente | glm-5.2 lo detectó como crítico por riesgo de phishing masivo |
| `JwtAuthGuard` no global | 🔴 Crítica (BE-SEC-005) | No enfatizado | glm-5.2 eleva a crítico por ser root cause de muchos IDORs |
| IDOR addresses | 🔴 Crítica (BE-SEC-001) | No mencionado explícitamente | glm-5.2 lo encontró leyendo `users.controller.ts` |
| IDOR WebSocket chat join | 🔴 Crítica (BE-SEC-004) | No mencionado | glm-5.2 lo detectó en `chat.gateway.ts` |
| Ausencia error boundaries | 🔴 Crítica (FE-RISK-001) | No enfatizado | glm-5.2 lo considera crítico por UX/resiliencia |
| `as never` typed-routes mobile | 🟢 Bajo (MOB-B1) | No crítico | Consenso: no crítico |

## Hallazgos detectados únicamente por glm-5.2

| Hallazgo | Ubicación | Por qué único |
|---|---|---|
| BE-SEC-003 `/email/send` sin auth | `email.controller.ts:13-16` | Modelo de riesgo de phishing no enfatizado antes |
| BE-SEC-006 logs de firmas webhook | `mercadopago.gateway.ts:38`, `stripe.gateway.ts:45` | Information disclosure en logs |
| BE-SEC-009 `notifications/send` userId del body | `notifications.controller.ts:14-18` | Abuso de push notifications |
| BE-SEC-010 `ai-agents/chat` userId del body | `ai-agents.controller.ts` | Suplantación vía agente IA |
| BE-INFO-001 `@ts-nocheck` en ai-agents | `ai-agents.service.ts:1` | Debilita type safety en código con datos sensibles |
| FE-RISK-001 ausencia error boundaries | todo `app/` | Ningún `error.tsx`/`loading.tsx`/`global-error.tsx` |
| FE-ARCH-001/002 componentes admin/chat en shared | `shared/components/` | Viola convención DDD del AGENTS.md |
| MOB-012 icon map hardcodeado 528 líneas | `shared/components/Icon/index.tsx` | Viola regla de oro icons0 del AGENTS.md |
| TRANSV-002 ausencia CI/CD | `.github/workflows/` no existe | No hay pipelines automáticos |

## Hallazgos reportados por otros modelos que NO pude confirmar

| Hallazgo (origen) | Estado | Por qué no confirmé |
|---|---|---|
| gpt-5 MOB-001 "URLs duplican /api/v1" | No reproducido | En `apiClient.ts:6` se construye `${BASE_URL}/api/v1` y los callers usan paths sin `/api/v1` (ver `apiClient.get('/users/me')`). El bug de doble `/api/v1` **no se observa en el código actual**. Posiblemente ya fue corregido entre auditorías o fue un falso positivo. |
| gpt-5 MOB-008 "promesa circular en refresh" | No reproducido | El `apiClient.ts:58-94` mobile tiene manejo de refresh con cola correcto (cola `_refreshQueue`, `_isRefreshing`, `drainQueue`). No se observa circularidad. |
| gpt-5 "fiscalidad/moneda/locale hardcodeado a Chile" | Parcialmente cierto | El `proxy.ts:154` setea `x-hireeo-lang` correctamente; `CountryProvider` gestiona moneda. No es tan grave como reporta gpt-5. |

## Diferencias de recomendación

| Tema | glm-5.2 recomienda | gpt-5 recomienda | Comentario |
|---|---|---|---|
| Arquitectura chat | Extraer a Pusher/Ably **solo si >100 conexiones concurrentes** | Mover a servicio dedicado | glm-5.2 más conservador, métricas-first |
| Microservicios | **NO** migrar | Implícitamente tampoco | Consenso |
| Auth NextAuth v4 → v5 | No migrar ahora | No mencionado | glm-5.2 prefiere estabilizar antes |
| Escala DB | Soft-delete + read replica solo si QPS>500 | No detallado | glm-5.2 métricas-first |

## Diferencias de scoring

| Área | glm-5.2 | gpt-5 |
|---|---|---|
| Overall | **4.2/10** | **3.8/10** |
| Frontend arq | 6.5 | 6.0 |
| Backend arq | 6.5 | (no reportado) |
| Mobile arq | 5.0 | 5.0 |
| Seguridad | 3.5 | 3.0-4.0 |
| Testing | 2.0 | 1.5-2.5 |
| DevOps | 2.0 | (no detallado) |
| Preparación prod | 3.0 | 2.5-3.0 |

glm-5.2 es **ligeramente más optimista** porque valora la arquitectura DDD subyacente y las buenas prácticas criptográficas existentes; gpt-5 pondera más los problemas de pagos y mobile. Ambos concluyen lo mismo: **no listo para producción**.

## Posibles falsos positivos (a revisar)

| Ítem | Auditoría origen | Validación glm-5.2 |
|---|---|---|
| Doble `/api/v1` en mobile | gpt-5 MOB-001 | **No reproducido** — posible falso positivo o ya corregido |
| Promesa circular en refresh mobile | gpt-5 MOB-008 | **No reproducido** — el código actual maneja la cola correctamente |
| Fiscalidad hardcodeada Chile | gpt-5 | **Parcialmente cierto** — `CountryProvider` sí gestiona moneda; algunos textos pueden estar localizados |

## Áreas que requieren revisión humana

1. **Webhooks de pago reales**: la única forma de validar FE-PAY-001 y FE-PAY-002 es con cuentas de prueba Stripe/MP y un servidor accesible.
2. **Configuración cloud real**: Vercel env vars, Neon pool size, Cloudinary signed uploads — no verificable sin accesos.
3. **Performance real**: LCP, INP, TTFB medidos en producción — no verificable sin deploy + tráfico.
4. **Comportamiento mobile en dispositivos físicos**: crashes, ANR, memoria — no verificable sin build nativo.
5. **Flujo KYC**: existe el módulo pero no se validó integración real con Stripe Identity.

## Conclusión de la comparación

Las 3 auditorías **coinciden sustancialmente** en los hallazgos críticos (mobile roto, pagos rotos, XSS, Next vulnerable, 0 tests). Esto refuerza la validez del diagnóstico. glm-5.2 aporta **9 hallazgos adicionales** principalmente en:
- Autorización backend (email, notifications, ai-agents sin auth o con userId del body).
- Error boundaries en frontend.
- Cumplimiento de convenciones AGENTS.md (icons0, estructura shared/).
- CI/CD.

La diferencia de scoring es mínima (4.2 vs 3.8) y ambos conclusiones son operacionalmente idénticas: **bloquear producción, ejecutar plan de estabilización de 30-60 días**.
