# 🚀 Quick Start - Testing E2E

Guía rápida para ejecutar los tests de QA antes de pasar a producción.

## 📦 Paso 1: Instalar Playwright

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps
```

## 🗄️ Paso 2: Preparar Datos de Prueba

```bash
# Este script crea usuarios de prueba en la base de datos
pnpm test:setup
```

Credenciales creadas:

- **Usuario regular:** `test-user@chiloeservicios.cl` / `TestPassword123!`
- **Administrador:** `test-admin@chiloeservicios.cl` / `TestPassword123!`

## 🧪 Paso 3: Ejecutar Tests

### Opción A: Todos los tests (Recomendado antes de producción)

```bash
pnpm test:e2e
```

### Opción B: Por categoría

```bash
# Solo seguridad de rutas
pnpm test:security

# Solo funcionalidad de admin
pnpm test:admin

# Solo funcionalidad de usuario
pnpm test:user

# Solo funcionalidad pública
pnpm test:guest
```

### Opción C: Modo interactivo (Debug)

```bash
# Modo UI - Interfaz gráfica
pnpm test:e2e:ui

# Ver navegador durante ejecución
pnpm test:e2e:headed

# Pausar y debuggear paso a paso
pnpm test:e2e:debug
```

## 📊 Paso 4: Ver Reporte

```bash
pnpm test:report
```

## ✅ Checklist Pre-Producción

- [ ] Instalar Playwright
- [ ] Ejecutar `pnpm test:setup`
- [ ] Ejecutar `pnpm test:e2e`
- [ ] Revisar reporte con `pnpm test:report`
- [ ] Todos los tests pasan ✅
- [ ] Corregir errores si los hay
- [ ] Re-ejecutar hasta que todo pase

## 📖 Documentación Completa

Ver `tests/README.md` para documentación detallada.

## 🆘 Problemas Comunes

### Error: "Usuario test no existe"

```bash
pnpm test:setup
```

### Error: "Estado de autenticación no encontrado"

```bash
pnpm exec playwright test --project=setup
```

### Tests muy lentos o timeout

```bash
# Asegúrate de que el servidor de desarrollo está corriendo
pnpm dev

# En otra terminal, ejecuta los tests
pnpm test:e2e
```

---

**¡Listo! Ya puedes verificar todo tu sistema antes de producción.** 🎉
