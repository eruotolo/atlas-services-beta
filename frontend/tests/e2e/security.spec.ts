import { expect, test } from '@playwright/test';

/**
 * Tests de Seguridad - Verificación de Protección de Rutas
 * Verifica que las rutas protegidas redirigen correctamente
 */

test.describe('Seguridad de Rutas - Usuario No Autenticado', () => {
    test('Ruta /perfil debe redirigir a /login', async ({ page }) => {
        await page.goto('/perfil');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /perfil/ajustes debe redirigir a /login', async ({ page }) => {
        await page.goto('/perfil/ajustes');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/usuarios debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/usuarios');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/servicios debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/servicios');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/categorias debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/categorias');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/calificaciones debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/calificaciones');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/sponsors debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/sponsors');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/pagos debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/pagos');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/precios-premium debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/precios-premium');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });

    test('Ruta /admin/interacciones debe redirigir a /login', async ({ page }) => {
        await page.goto('/admin/interacciones');
        await page.waitForURL('/login');
        expect(page.url()).toContain('/login');
    });
});

test.describe('Seguridad de Rutas - Usuario Regular Autenticado', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('Usuario regular puede acceder a /perfil', async ({ page }) => {
        await page.goto('/perfil');
        await expect(
            page
                .locator('text=Mis Servicios Publicados')
                .or(page.locator('text=Estadísticas'))
                .or(page.locator('text=Ajustes de Perfil'))
                .first(),
        ).toBeVisible({ timeout: 10000 });
        expect(page.url()).toContain('/perfil');
    });

    test('Usuario regular puede acceder a /perfil/ajustes', async ({ page }) => {
        await page.goto('/perfil/ajustes');
        await expect(
            page.locator('text=Ajustes').or(page.locator('text=Configuración')),
        ).toBeVisible();
        expect(page.url()).toContain('/perfil/ajustes');
    });

    test('Usuario regular NO puede acceder a /admin - debe redirigir a /unauthorized', async ({
        page,
    }) => {
        await page.goto('/admin');
        // Esperar redirección o mensaje de error
        await page.waitForURL(/\/(unauthorized|login|perfil)/);
        const url = page.url();
        expect(url).toMatch(/\/(unauthorized|login|perfil)/);
    });

    test('Usuario regular NO puede acceder a /admin/usuarios', async ({ page }) => {
        await page.goto('/admin/usuarios');
        await page.waitForURL(/\/(unauthorized|login|perfil)/);
        const url = page.url();
        expect(url).toMatch(/\/(unauthorized|login|perfil)/);
    });

    test('Usuario regular NO puede acceder a /admin/servicios', async ({ page }) => {
        await page.goto('/admin/servicios');
        await page.waitForURL(/\/(unauthorized|login|perfil)/);
        const url = page.url();
        expect(url).toMatch(/\/(unauthorized|login|perfil)/);
    });
});

test.describe('Seguridad de Rutas - Administrador', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin puede acceder a /admin', async ({ page }) => {
        await page.goto('/admin');
        await expect(
            page.locator('text=Dashboard').or(page.locator('text=Panel')).first(),
        ).toBeVisible();
        expect(page.url()).toContain('/admin');
    });

    test('Admin puede acceder a /admin/usuarios', async ({ page }) => {
        await page.goto('/admin/usuarios');
        await expect(page.locator('text=Usuarios').first()).toBeVisible();
        expect(page.url()).toContain('/admin/usuarios');
    });

    test('Admin puede acceder a /admin/servicios', async ({ page }) => {
        await page.goto('/admin/servicios');
        await expect(
            page
                .getByRole('heading')
                .filter({ hasText: /Servicios/i })
                .first(),
        ).toBeVisible();
        expect(page.url()).toContain('/admin/servicios');
    });

    test('Admin puede acceder a /admin/categorias', async ({ page }) => {
        await page.goto('/admin/categorias');
        await expect(
            page.locator('text=Categorías').or(page.locator('text=Categorias')).first(),
        ).toBeVisible();
        expect(page.url()).toContain('/admin/categorias');
    });

    test('Admin puede acceder a /admin/calificaciones', async ({ page }) => {
        await page.goto('/admin/calificaciones');
        await expect(page.locator('text=Calificaciones').first()).toBeVisible();
        expect(page.url()).toContain('/admin/calificaciones');
    });

    test('Admin puede acceder a /admin/sponsors', async ({ page }) => {
        await page.goto('/admin/sponsors');
        await expect(page.locator('text=Sponsors').first()).toBeVisible();
        expect(page.url()).toContain('/admin/sponsors');
    });

    test('Admin puede acceder a /admin/pagos', async ({ page }) => {
        await page.goto('/admin/pagos');
        await expect(page.locator('text=Pagos').first()).toBeVisible();
        expect(page.url()).toContain('/admin/pagos');
    });

    test('Admin puede acceder a /admin/precios-premium', async ({ page }) => {
        await page.goto('/admin/precios-premium');
        await expect(
            page.locator('text=Premium').or(page.locator('text=Precios')).first(),
        ).toBeVisible();
        expect(page.url()).toContain('/admin/precios-premium');
    });

    test('Admin puede acceder a /admin/interacciones', async ({ page }) => {
        await page.goto('/admin/interacciones');
        await expect(page.locator('text=Interacciones').first()).toBeVisible();
        expect(page.url()).toContain('/admin/interacciones');
    });
});

test.describe('Seguridad de Rutas Públicas - Acceso Universal', () => {
    const publicRoutes = [
        { path: '/', name: 'Home' },
        { path: '/login', name: 'Login' },
        { path: '/registro', name: 'Registro' },
        { path: '/buscar', name: 'Búsqueda' },
        { path: '/suscripcion-pro', name: 'Suscripción Pro' },
        { path: '/como-funciona', name: 'Cómo Funciona' },
        { path: '/quienes-somos', name: 'Quiénes Somos' },
        { path: '/contacto', name: 'Contacto' },
        { path: '/ayuda', name: 'Ayuda' },
        { path: '/privacidad', name: 'Privacidad' },
        { path: '/terminos', name: 'Términos' },
    ];

    for (const route of publicRoutes) {
        test(`Ruta pública ${route.path} (${route.name}) debe ser accesible sin autenticación`, async ({
            page,
        }) => {
            const response = await page.goto(route.path);
            expect(response?.status()).toBe(200);
            expect(page.url()).toContain(route.path);
        });
    }
});
