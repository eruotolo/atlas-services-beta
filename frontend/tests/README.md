# 🧪 Suite de Tests E2E - Chiloé Servicios

Sistema completo de QA y testing automatizado usando Playwright para verificar funcionalidad, seguridad y estabilidad antes de pasar a producción.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Preparación de Datos](#preparación-de-datos)
- [Ejecución de Tests](#ejecución-de-tests)
- [Estructura de Tests](#estructura-de-tests)
- [Tests de Seguridad](#tests-de-seguridad)
- [Tests CRUD Admin](#tests-crud-admin)
- [Tests CRUD Usuario](#tests-crud-usuario)
- [Tests Guest (Público)](#tests-guest-público)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

- Node.js 18+
- pnpm instalado
- Base de datos PostgreSQL configurada
- Variables de entorno configuradas (.env.local)

---

## 📦 Instalación

### 1. Instalar Playwright

```bash
# Instalar Playwright y dependencias
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps
```

### 2. Verificar Instalación

```bash
# Verificar que Playwright está instalado
pnpm exec playwright --version
```

---

## 🗄️ Preparación de Datos

**IMPORTANTE:** Antes de ejecutar los tests, debes preparar los usuarios de prueba en la base de datos.

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar script de preparación
pnpm tsx tests/scripts/setup-test-users.ts
```

Este script creará:

- ✅ Usuario regular: `test-user@chiloeservicios.cl` / `TestPassword123!`
- ✅ Usuario admin: `test-admin@chiloeservicios.cl` / `TestPassword123!`
- ✅ Rol de SuperAdministrador asignado al admin
- ✅ Categorías de ejemplo (si no existen)
- ✅ Servicio de prueba para el usuario regular

### Opción 2: Manual (mediante Prisma Studio)

```bash
# Abrir Prisma Studio
pnpm db:studio
```

Crear manualmente:

1. **Usuario Regular:**
    - email: `test-user@chiloeservicios.cl`
    - password: Hash de `TestPassword123!` (usar bcrypt con 10 rounds)
    - nombre: `Usuario Test Regular`

2. **Usuario Admin:**
    - email: `test-admin@chiloeservicios.cl`
    - password: Hash de `TestPassword123!`
    - nombre: `Admin Test`
    - Asignar rol `SuperAdministrador` en tabla `UserRole`

---

## 🚀 Ejecución de Tests

### Comandos Principales

```bash
# Ejecutar todos los tests
pnpm test:e2e

# Ejecutar solo tests de seguridad
pnpm exec playwright test security.spec.ts

# Ejecutar solo tests de admin
pnpm exec playwright test admin.spec.ts

# Ejecutar solo tests de usuario
pnpm exec playwright test user.spec.ts

# Ejecutar solo tests de guest
pnpm exec playwright test guest.spec.ts

# Ejecutar en modo UI (interactivo)
pnpm exec playwright test --ui

# Ejecutar con reporte HTML
pnpm exec playwright test --reporter=html

# Ver último reporte HTML
pnpm exec playwright show-report
```

### Ejecución por Proyecto

```bash
# Solo setup (crear estados de autenticación)
pnpm exec playwright test --project=setup

# Tests como usuario guest
pnpm exec playwright test --project=chromium-guest

# Tests como usuario regular
pnpm exec playwright test --project=chromium-user

# Tests como admin
pnpm exec playwright test --project=chromium-admin

# Tests de seguridad
pnpm exec playwright test --project=security
```

### Debug de Tests

```bash
# Ejecutar en modo debug con inspector
pnpm exec playwright test --debug

# Ejecutar test específico en debug
pnpm exec playwright test security.spec.ts:10 --debug

# Ejecutar con headed mode (ver navegador)
pnpm exec playwright test --headed

# Pausar ejecución en punto específico
# Agregar await page.pause() en el código del test
```

---

## 📁 Estructura de Tests

```
tests/
├── e2e/
│   ├── auth.setup.ts           # Setup de autenticación
│   ├── security.spec.ts        # Tests de seguridad de rutas
│   ├── admin.spec.ts           # Tests CRUD admin
│   ├── user.spec.ts            # Tests CRUD usuario
│   └── guest.spec.ts           # Tests usuario no autenticado
├── scripts/
│   └── setup-test-users.ts     # Script de preparación de datos
└── README.md                   # Esta documentación

playwright/
└── .auth/
    ├── user.json               # Estado de sesión usuario (generado)
    └── admin.json              # Estado de sesión admin (generado)

playwright.config.ts             # Configuración de Playwright
```

---

## 🔐 Tests de Seguridad

**Archivo:** `tests/e2e/security.spec.ts`

### Cobertura

✅ **Usuario No Autenticado:**

- Verifica redirección a `/login` para rutas protegidas
- Verifica acceso a rutas públicas

✅ **Usuario Regular Autenticado:**

- Puede acceder a `/perfil` y `/perfil/ajustes`
- NO puede acceder a rutas `/admin/*` (redirige a `/unauthorized`)

✅ **Administrador:**

- Acceso completo a todas las rutas `/admin/*`

✅ **Rutas Públicas:**

- Todas accesibles sin autenticación (status 200)

### Rutas Protegidas Verificadas

- `/perfil`
- `/perfil/ajustes`
- `/admin`
- `/admin/usuarios`
- `/admin/servicios`
- `/admin/categorias`
- `/admin/calificaciones`
- `/admin/sponsors`
- `/admin/pagos`
- `/admin/precios-premium`
- `/admin/interacciones`

---

## 🛠️ Tests CRUD Admin

**Archivo:** `tests/e2e/admin.spec.ts`

### Cobertura

#### ✅ Categorías

- Cargar página
- Abrir modal de crear
- Validar campos requeridos
- Crear categoría
- Editar categoría
- Eliminar categoría

#### ✅ Usuarios

- Cargar página
- Abrir modal de crear
- Validar email
- Crear usuario
- Editar usuario

#### ✅ Servicios

- Cargar página
- Abrir modal de crear
- Validar campos
- Filtrar servicios
- Cambiar estado activo/inactivo

#### ✅ Calificaciones

- Cargar página
- Filtrar por estado
- Aprobar calificación
- Rechazar calificación

#### ✅ Sponsors

- Cargar página
- Abrir modal de crear

#### ✅ Precios Premium

- Cargar página
- Mostrar planes existentes

#### ✅ Pagos

- Cargar página
- Filtrar por fecha

#### ✅ Interacciones (Analytics)

- Cargar página
- Mostrar estadísticas

---

## 👤 Tests CRUD Usuario

**Archivo:** `tests/e2e/user.spec.ts`

### Cobertura

#### ✅ Gestión de Perfil

- Cargar página de perfil
- Mostrar información del usuario
- Navegar a ajustes
- Actualizar nombre
- Actualizar teléfono
- Validar cambio de contraseña

#### ✅ Publicar Servicio

- Cargar página de publicar
- Mostrar formulario
- Validar campos requeridos
- Seleccionar categoría
- Seleccionar comuna
- Llenar datos de contacto
- Checkbox "Usar mis datos"

#### ✅ Gestión de Mis Servicios

- Listar servicios del usuario
- Activar/desactivar servicio
- Editar servicio
- Actualizar datos en modal de edición
- Confirmación antes de eliminar
- Link a actualizar a premium

#### ✅ Planes Premium

- Ver página de suscripción
- Mostrar planes disponibles
- Ver detalles de cada plan

#### ✅ Búsqueda de Servicios

- Buscar por texto
- Filtrar por categoría
- Filtrar por comuna
- Ver detalle de servicio

#### ✅ Dejar Reseña

- Navegar a formulario de reseña desde detalle

---

## 🌐 Tests Guest (Público)

**Archivo:** `tests/e2e/guest.spec.ts`

### Cobertura

#### ✅ Navegación Pública

- Cargar página principal
- Hero section
- Navbar con links
- Links a login y registro

#### ✅ Autenticación - Login

- Cargar página de login
- Formulario con campos requeridos
- Validar campos vacíos
- Validar formato de email
- Mostrar error con credenciales incorrectas
- Link a registro
- Link "Olvidé mi contraseña"

#### ✅ Autenticación - Registro

- Cargar página de registro
- Formulario con campos requeridos
- Validar campos vacíos
- Validar formato de email
- Validar requisitos de contraseña
- Validar confirmación de contraseña
- Link a login
- Checkbox términos y condiciones

#### ✅ Búsqueda Pública

- Buscar servicios sin autenticación
- Mostrar resultados
- Ver detalle de servicio
- Filtrar por categoría
- Filtrar por comuna

#### ✅ Páginas Informativas

- Cómo Funciona
- Quiénes Somos
- Contacto (con formulario)
- Ayuda
- Política de Privacidad
- Términos y Condiciones

#### ✅ Planes Premium

- Ver planes sin autenticación
- Mostrar precios
- CTA para contratar

#### ✅ Footer y Links

- Footer presente en todas las páginas
- Links a redes sociales
- Links a términos y privacidad

#### ✅ Responsiveness

- Responsive en móvil (375x667)
- Responsive en tablet (768x1024)

---

## 🔄 CI/CD

### GitHub Actions (Ejemplo)

```yaml
name: E2E Tests

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: 18

            - name: Install dependencies
              run: pnpm install

            - name: Install Playwright
              run: pnpm exec playwright install --with-deps

            - name: Setup Database
              run: pnpm db:push

            - name: Seed Test Users
              run: pnpm tsx tests/scripts/setup-test-users.ts

            - name: Run E2E Tests
              run: pnpm test:e2e
              env:
                  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
                  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

            - name: Upload Test Report
              if: always()
              uses: actions/upload-artifact@v3
              with:
                  name: playwright-report
                  path: playwright-report/
```

---

## 🐛 Troubleshooting

### Error: "Estado de autenticación no encontrado"

```bash
# Regenerar estados de autenticación
pnpm exec playwright test --project=setup
```

### Error: "Usuario test no existe"

```bash
# Ejecutar script de preparación
pnpm tsx tests/scripts/setup-test-users.ts
```

### Tests fallan por timeout

```bash
# Aumentar timeout en playwright.config.ts
# O ejecutar con más tiempo:
pnpm exec playwright test --timeout=60000
```

### Base de datos no sincronizada

```bash
# Aplicar migraciones
pnpm db:migrate

# O push schema en desarrollo
pnpm db:push
```

### Ver screenshots de fallos

Los screenshots y videos de tests fallidos se guardan en:

```
test-results/
├── [nombre-test]/
│   ├── test-failed-1.png
│   └── trace.zip
```

Para ver trace interactivo:

```bash
pnpm exec playwright show-trace test-results/[nombre-test]/trace.zip
```

### Limpiar caché de Playwright

```bash
# Limpiar todo
rm -rf playwright/.auth
rm -rf test-results
rm -rf playwright-report

# Reinstalar navegadores
pnpm exec playwright install --force
```

---

## 📊 Métricas y Reportes

### Reporte HTML

Después de ejecutar tests, ver reporte:

```bash
pnpm exec playwright show-report
```

El reporte incluye:

- ✅ Tests pasados/fallidos
- ⏱️ Duración de cada test
- 📸 Screenshots de fallos
- 🎥 Videos de ejecución
- 📊 Trace detallado

### Reporte JSON

Para integración con herramientas externas:

```bash
# El archivo JSON se genera en:
test-results/results.json
```

---

## 📝 Mejores Prácticas

### Antes de Cada Release

1. ✅ Ejecutar script de preparación de datos
2. ✅ Ejecutar suite completa de tests
3. ✅ Revisar reportes de fallos
4. ✅ Corregir issues encontrados
5. ✅ Re-ejecutar tests hasta que todos pasen

### Durante Desarrollo

- Ejecutar tests relacionados al feature que desarrollas
- Usar `--headed` para ver comportamiento del navegador
- Usar `--debug` para pausar y explorar estado

### En CI/CD

- Ejecutar en cada PR antes de merge
- Bloquear deploy si tests fallan
- Guardar reportes como artifacts

---

## 🎯 Cobertura Total

```
📊 Resumen de Cobertura:
├─ 🔐 Seguridad: 25+ tests
├─ 🛠️  CRUD Admin: 35+ tests
├─ 👤 CRUD Usuario: 30+ tests
└─ 🌐 Guest/Público: 40+ tests

Total: 130+ tests automatizados
```

---

## 🤝 Contribuir

Para agregar nuevos tests:

1. Crear archivo en `tests/e2e/[nombre].spec.ts`
2. Seguir estructura existente
3. Documentar qué verifica cada test
4. Actualizar esta documentación

---

## 📞 Soporte

Si encuentras problemas con los tests, documenta:

1. Comando ejecutado
2. Error completo (con stack trace)
3. Screenshots si es relevante
4. Estado de la base de datos

---

**✨ Tests creados para garantizar calidad y estabilidad antes de producción ✨**
