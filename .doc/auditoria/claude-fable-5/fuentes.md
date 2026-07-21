# Fuentes de internet consultadas

Consultadas el **2026-07-18**. Priorizadas fuentes oficiales (GitHub Security Advisories, changelogs oficiales de frameworks, docs de Auth.js/NestJS/Expo). Los blogs se usan solo como contexto secundario de mercado, nunca como base de una decisión técnica.

| # | Título | Autor/Org | URL | Publicación | Tema | Hallazgo relacionado | Por qué es confiable |
|---|--------|-----------|-----|-------------|------|----------------------|----------------------|
| 1 | Cache poisoning via RSC cache-busting — GHSA-vfv6-92ff-j949 / CVE-2026-44582 | Vercel / GitHub Advisory DB | https://github.com/advisories/GHSA-vfv6-92ff-j949 | May 2026 | Vulnerabilidad Next.js | H2 | Advisory oficial del vendor (Vercel) |
| 2 | Next.js 16.2.6 / 15.5.18: 13 security fixes | Vercel security advisories | https://github.com/vercel/next.js/security/advisories | May 2026 | Parches Next.js | H2 | Repositorio oficial |
| 3 | PoC collection Next.js 16.2.4 (12 CVE) | dwisiswant0 | https://github.com/dwisiswant0/next-16.2.4-pocs | 2026 | Superficie CVE Next 16.x | H2 | Lista los CVE parcheados en 16.2.5/16.2.6 |
| 4 | Announcing NestJS 11 | Trilon (equipo NestJS) | https://trilon.io/blog/announcing-nestjs-11-whats-new | 2025 | Versión NestJS | M-DevOps / arquitectura | Blog oficial del equipo core |
| 5 | @nestjs/core versions (v11.1.28, jul 2026) | npm | https://www.npmjs.com/package/@nestjs/core?activeTab=versions | Jul 2026 | Estado versión NestJS | Backend deuda de versión | Registro oficial npm |
| 6 | Expo SDK 55 changelog (RN 0.83) | Expo | https://expo.dev/changelog/sdk-55 | Feb 2026 | Versión Expo/RN | Mobile deuda de versión | Changelog oficial |
| 7 | Expo SDK 56 beta (RN 0.85) | Expo | https://expo.dev/changelog/sdk-56-beta | May 2026 | Última versión Expo | Mobile deuda de versión | Changelog oficial |
| 8 | Migrating to Auth.js v5 | Auth.js | https://authjs.dev/getting-started/migrating-to-v5 | 2026 | Migración next-auth v4→v5 | H2 / deuda auth | Documentación oficial de la librería |
| 9 | NextAuth con Next.js 16 (issue #13302) | nextauthjs/next-auth | https://github.com/nextauthjs/next-auth/issues/13302 | 2026 | Compatibilidad next-auth v4/v5 + Next 16 | H2 / deuda auth | Issue tracker oficial |
| 10 | GHSA-g8m3-5g58-fq7m (undici) | GitHub Advisory DB | https://github.com/advisories/GHSA-g8m3-5g58-fq7m | 2026 | Vuln transitiva tooling | Seguridad deps | Advisory oficial |
| 11 | Thumbtack vs TaskRabbit business model | Yo!Gigs | https://www.yo-gigs.com/blog/thumbtack-vs-taskrabbit-business-model-comparison/ | 2026 | Modelo de negocio competencia | Sección competencia | Contexto de mercado (secundario) |
| 12 | TaskRabbit vs Thumbtack 2026 | JPLoft | https://www.jploft.com/blog/taskrabbit-vs-thumbtack | 2026 | Features competencia | Sección competencia | Contexto de mercado (secundario) |

## Notas de confiabilidad

- Las decisiones técnicas de este informe (upgrade de Next.js, migración de auth, incompatibilidad WebSocket-serverless) se sustentan en **fuentes oficiales del vendor** (1–10).
- El análisis de competencia (11–12) es **contexto de mercado**, no base de ninguna recomendación técnica de arquitectura; se marca explícitamente como observación/inferencia en `competencia-e-investigacion.md`.
