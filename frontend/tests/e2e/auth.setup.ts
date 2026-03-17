import { expect, test as setup } from '@playwright/test';
import path from 'node:path';

/**
 * Setup de Autenticación - Crea estados de sesión para tests
 *
 * IMPORTANTE: Antes de ejecutar, debes tener:
 * 1. Un usuario regular en la base de datos con email: test-user@chiloeservicios.cl
 * 2. Un usuario admin con email: test-admin@chiloeservicios.cl
 * 3. Ambos con contraseña: TestPassword123!
 */

const userAuthFile = path.join(__dirname, '../../playwright/.auth/user.json');
const adminAuthFile = path.join(__dirname, '../../playwright/.auth/admin.json');

// Setup para usuario regular
setup('authenticate as user', async ({ page }) => {
    console.log('🔐 Autenticando usuario regular...');

    await page.goto('/login');

    // Llenar formulario de login
    await page.fill('input[name="email"]', 'test-user@chiloeservicios.cl');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Click en botón de login
    await page.click('button[type="submit"]');

    // Esperar redirección al perfil
    await page.waitForURL('/perfil', { timeout: 10000 });

    // Verificar que estamos autenticados
    await expect(page.locator('text=Ajustes de Perfil')).toBeVisible({ timeout: 5000 });

    // Guardar estado de autenticación
    await page.context().storageState({ path: userAuthFile });

    console.log('✅ Usuario regular autenticado y estado guardado');
});

// Setup para administrador
setup('authenticate as admin', async ({ page }) => {
    console.log('🔐 Autenticando administrador...');

    await page.goto('/login');

    // Llenar formulario de login
    await page.fill('input[name="email"]', 'test-admin@chiloeservicios.cl');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Click en botón de login
    await page.click('button[type="submit"]');

    // Esperar redirección al perfil
    await page.waitForURL('/perfil', { timeout: 10000 });

    // Verificar que estamos autenticados
    await expect(page.locator('text=Ajustes de Perfil')).toBeVisible({ timeout: 5000 });

    // Navegar al admin para verificar acceso
    await page.goto('/admin');
    // Usamos un selector más específico y válido
    await expect(
        page
            .locator('h1:has-text("Panel")')
            .or(page.locator('h2:has-text("Panel")'))
            .or(page.locator('text="Panel Admin"'))
            .first(),
    ).toBeVisible({
        timeout: 5000,
    });

    // Guardar estado de autenticación
    await page.context().storageState({ path: adminAuthFile });

    console.log('✅ Administrador autenticado y estado guardado');
});
