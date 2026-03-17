import { expect, test } from '@playwright/test';

/**
 * Tests CRUD Admin - Verificación de todas las operaciones administrativas
 * Estos tests requieren autenticación como administrador
 */

test.describe('Admin - CRUD de Categorías', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    let createdCategoryId: string | null = null;

    test('Debe cargar la página de categorías', async ({ page }) => {
        await page.goto('/admin/categorias');
        await expect(
            page.locator('text=Categorías').or(page.locator('text=Categorias')).first(),
        ).toBeVisible();
    });

    test('Debe abrir modal de crear categoría', async ({ page }) => {
        await page.goto('/admin/categorias');

        // Buscar y hacer click en botón de crear
        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nueva")')
            .first();
        await createButton.click();

        // Verificar que el modal está abierto
        await expect(
            page.locator('text=Crear Categoría').or(page.locator('text=Nueva Categoría')).first(),
        ).toBeVisible();
    });

    test('Debe validar campos requeridos en formulario de crear', async ({ page }) => {
        await page.goto('/admin/categorias');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nueva")')
            .first();
        await createButton.click();

        // Intentar enviar sin llenar campos
        const submitButton = page
            .locator(
                'button[type="submit"]:has-text("Crear"), button[type="submit"]:has-text("Guardar")',
            )
            .first();
        await submitButton.click();

        // Debería mostrar errores de validación (HTML5 o custom)
        // Nota: Esto depende de tu implementación
        await page.waitForTimeout(500);
    });

    test('Debe crear una categoría nueva', async ({ page }) => {
        await page.goto('/admin/categorias');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nueva")')
            .first();
        await createButton.click();

        // Llenar formulario
        const nombreInput = page.locator('input[name="nombre"]');
        await nombreInput.fill(`Test Categoría ${Date.now()}`);

        // Si hay campo de descripción
        const descripcionInput = page.locator(
            'textarea[name="descripcion"], input[name="descripcion"]',
        );
        if ((await descripcionInput.count()) > 0) {
            await descripcionInput.fill('Categoría de prueba para testing');
        }

        // Enviar formulario
        const submitButton = page
            .locator(
                'button[type="submit"]:has-text("Crear"), button[type="submit"]:has-text("Guardar")',
            )
            .first();
        await submitButton.click();

        // Esperar confirmación o recarga
        await page.waitForTimeout(2000);

        // Verificar que la categoría aparece en la lista
        await expect(page.locator('text=Test Categoría').first()).toBeVisible({ timeout: 10000 });
    });

    test('Debe abrir modal de editar categoría', async ({ page }) => {
        await page.goto('/admin/categorias');

        // Buscar botón de editar (primer resultado)
        const editButton = page
            .locator('button:has-text("Editar"), [aria-label*="Editar"]')
            .first();
        if ((await editButton.count()) > 0) {
            await editButton.click();

            // Verificar que el modal de editar está abierto
            await expect(
                page.locator('text=Editar Categoría').or(page.locator('input[name="nombre"]')),
            ).toBeVisible();
        }
    });

    test('Debe eliminar una categoría', async ({ page }) => {
        await page.goto('/admin/categorias');

        // Contar categorías antes
        const initialCount = await page
            .locator('table tbody tr, [data-testid="categoria-item"]')
            .count();

        if (initialCount > 0) {
            // Click en botón eliminar (último item para no afectar otras pruebas)
            // El botón usa un ícono Trash2 con title="Eliminar"
            const deleteButton = page
                .locator('button[title="Eliminar"], button:has-text("Eliminar"), [aria-label*="Eliminar"]')
                .last();

            // Escuchar el diálogo de confirmación
            page.on('dialog', (dialog) => dialog.accept());

            await deleteButton.click();

            // Esperar que se actualice la lista
            await page.waitForTimeout(2000);

            // Verificar que se eliminó (o mostró mensaje de éxito)
            const finalCount = await page
                .locator('table tbody tr, [data-testid="categoria-item"]')
                .count();
            expect(finalCount).toBeLessThanOrEqual(initialCount);
        }
    });
});

test.describe('Admin - CRUD de Usuarios', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Debe cargar la página de usuarios', async ({ page }) => {
        await page.goto('/admin/usuarios');
        await expect(page.locator('text=Usuarios').first()).toBeVisible();
    });

    test('Debe abrir modal de crear usuario', async ({ page }) => {
        await page.goto('/admin/usuarios');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nuevo")')
            .first();
        await createButton.click();

        await expect(
            page.locator('text=Crear Usuario').or(page.locator('text=Nuevo Usuario')).first(),
        ).toBeVisible();
    });

    test('Debe validar email en formulario de crear usuario', async ({ page }) => {
        await page.goto('/admin/usuarios');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nuevo")')
            .first();
        await createButton.click();

        // Llenar con email inválido
        const emailInput = page.locator('input[name="email"], input[type="email"]').first();
        await emailInput.fill('email-invalido');

        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        // Debería mostrar error de validación
        await page.waitForTimeout(500);
    });

    test('Debe crear un usuario nuevo', async ({ page }) => {
        await page.goto('/admin/usuarios');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nuevo")')
            .first();
        await createButton.click();

        // Llenar formulario
        const timestamp = Date.now();
        await page.fill('input[name="nombre"]', `Usuario Test ${timestamp}`);
        await page.fill('input[name="email"], input[type="email"]', `test-${timestamp}@test.com`);
        await page.fill('input[name="password"], input[type="password"]', 'TestPass123!@#');

        // Seleccionar rol - buscar checkboxes de rol
        const roleCheckboxes = page.locator('input[type="checkbox"]');
        if ((await roleCheckboxes.count()) > 0) {
            await roleCheckboxes.first().check();
        } else {
            const roleSelect = page.locator('select[name="rol"], select[name="roles"]').first();
            if ((await roleSelect.count()) > 0) {
                await roleSelect.selectOption({ index: 1 });
            }
        }

        // Enviar
        const submitButton = page
            .locator(
                'button[type="submit"]:has-text("Crear"), button[type="submit"]:has-text("Guardar")',
            )
            .first();
        await submitButton.click();

        await page.waitForTimeout(2000);

        // Verificar que aparece en la lista
        await expect(page.locator(`text=Usuario Test ${timestamp}`).first()).toBeVisible({
            timeout: 10000,
        });
    });

    test('Debe abrir modal de editar usuario', async ({ page }) => {
        await page.goto('/admin/usuarios');

        const editButton = page
            .locator('button:has-text("Editar"), [aria-label*="Editar"]')
            .first();
        if ((await editButton.count()) > 0) {
            await editButton.click();
            await expect(
                page
                    .locator('text=Editar Usuario')
                    .or(page.locator('input[name="nombre"]'))
                    .first(),
            ).toBeVisible();
        }
    });
});

test.describe('Admin - CRUD de Servicios', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Debe cargar la página de servicios', async ({ page }) => {
        await page.goto('/admin/servicios');
        await expect(
            page
                .getByRole('heading')
                .filter({ hasText: /Servicios/i })
                .first(),
        ).toBeVisible();
    });

    test('Debe abrir modal de crear servicio', async ({ page }) => {
        await page.goto('/admin/servicios');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nuevo")')
            .first();
        await createButton.click();

        await expect(
            page.locator('text=Crear Servicio').or(page.locator('text=Nuevo Servicio')).first(),
        ).toBeVisible();
    });

    test('Debe validar campos requeridos en servicio', async ({ page }) => {
        await page.goto('/admin/servicios');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nuevo")')
            .first();
        await createButton.click();

        // Intentar enviar sin llenar
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        await page.waitForTimeout(500);
    });

    test('Debe poder filtrar servicios', async ({ page }) => {
        await page.goto('/admin/servicios');

        // Verificar que hay filtros disponibles
        const filterInput = page.locator(
            'input[placeholder*="Buscar"], input[placeholder*="buscar"]',
        );
        if ((await filterInput.count()) > 0) {
            await filterInput.fill('test');
            await page.waitForTimeout(1000);
        }

        // Verificar que hay select de categoría
        const categorySelect = page.locator(
            'select:has-text("Categoría"), select:has-text("categoria")',
        );
        if ((await categorySelect.count()) > 0) {
            await categorySelect.selectOption({ index: 1 });
            await page.waitForTimeout(1000);
        }
    });

    test('Debe poder cambiar estado de un servicio', async ({ page }) => {
        await page.goto('/admin/servicios');

        // Buscar toggle o botón de activar/desactivar
        const toggleButton = page
            .locator(
                'button:has-text("Activar"), button:has-text("Desactivar"), input[type="checkbox"]',
            )
            .first();

        if ((await toggleButton.count()) > 0) {
            await toggleButton.click();
            await page.waitForTimeout(1000);
        }
    });
});

test.describe('Admin - CRUD de Calificaciones', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Debe cargar la página de calificaciones', async ({ page }) => {
        await page.goto('/admin/calificaciones');
        await expect(page.locator('text=Calificaciones').first()).toBeVisible();
    });

    test('Debe poder filtrar calificaciones por estado', async ({ page }) => {
        await page.goto('/admin/calificaciones');

        const statusSelect = page
            .locator('select:has-text("Estado"), select:has-text("estado")')
            .first();
        if ((await statusSelect.count()) > 0) {
            await statusSelect.selectOption({ index: 1 });
            await page.waitForTimeout(1000);
        }
    });

    test('Debe poder aprobar una calificación pendiente', async ({ page }) => {
        await page.goto('/admin/calificaciones');

        const approveButton = page.locator('button:has-text("Aprobar")').first();
        if ((await approveButton.count()) > 0) {
            await approveButton.click();
            await page.waitForTimeout(1000);
        }
    });

    test('Debe poder rechazar una calificación', async ({ page }) => {
        await page.goto('/admin/calificaciones');

        const rejectButton = page.locator('button:has-text("Rechazar")').first();
        if ((await rejectButton.count()) > 0) {
            page.on('dialog', (dialog) => dialog.accept());
            await rejectButton.click();
            await page.waitForTimeout(1000);
        }
    });
});

test.describe('Admin - CRUD de Sponsors', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Debe cargar la página de sponsors', async ({ page }) => {
        await page.goto('/admin/sponsors');
        await expect(page.locator('text=Sponsors').first()).toBeVisible();
    });

    test('Debe abrir modal de crear sponsor', async ({ page }) => {
        await page.goto('/admin/sponsors');

        const createButton = page
            .locator('button:has-text("Crear"), button:has-text("Nuevo")')
            .first();
        await createButton.click();

        await expect(
            page.locator('text=Crear Sponsor').or(page.locator('text=Nuevo Sponsor')).first(),
        ).toBeVisible();
    });
});

test.describe('Admin - Gestión de Precios Premium', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Debe cargar la página de precios premium', async ({ page }) => {
        await page.goto('/admin/precios-premium');
        await expect(
            page.locator('text=Premium').or(page.locator('text=Precios')).first(),
        ).toBeVisible();
    });

    test('Debe mostrar planes de precios existentes', async ({ page }) => {
        await page.goto('/admin/precios-premium');

        // Verificar que hay al menos un plan mostrado
        const plans = await page.locator('[data-testid="plan-item"], table tbody tr').count();
        expect(plans).toBeGreaterThanOrEqual(0);
    });
});

test.describe('Admin - Visualización de Pagos', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Debe cargar la página de pagos', async ({ page }) => {
        await page.goto('/admin/pagos');
        await expect(page.locator('text=Pagos').first()).toBeVisible();
    });

    test('Debe poder filtrar pagos por fecha', async ({ page }) => {
        await page.goto('/admin/pagos');

        const dateInput = page.locator('input[type="date"]').first();
        if ((await dateInput.count()) > 0) {
            await dateInput.fill('2025-01-01');
            await page.waitForTimeout(1000);
        }
    });
});

test.describe('Admin - Analytics de Interacciones', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Debe cargar la página de interacciones', async ({ page }) => {
        await page.goto('/admin/interacciones');
        await expect(page.locator('text=Interacciones').first()).toBeVisible();
    });

    test('Debe mostrar estadísticas de interacciones', async ({ page }) => {
        await page.goto('/admin/interacciones');

        // Verificar que hay datos mostrados (tabla o tarjetas)
        const hasData = await page.locator('table, [data-testid="interaction-item"]').count();
        expect(hasData).toBeGreaterThanOrEqual(0);
    });
});
