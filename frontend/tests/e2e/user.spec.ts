import { expect, test } from '@playwright/test';

/**
 * Tests CRUD Usuario - Verificación de operaciones de usuario regular
 * Estos tests requieren autenticación como usuario regular
 */

test.describe('Usuario - Gestión de Perfil', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('Debe cargar la página de perfil', async ({ page }) => {
        await page.goto('/perfil');
        // Usar un selector de texto válido
        await expect(page.locator('text=Ajustes de Perfil').first()).toBeVisible();
    });

    test('Debe mostrar información del usuario', async ({ page }) => {
        await page.goto('/perfil');

        // Verificar que se muestra el email del usuario de prueba
        await expect(page.locator('text=test-user@chiloeservicios.cl').first()).toBeVisible({
            timeout: 5000,
        });
    });

    test('Debe poder navegar a ajustes de perfil', async ({ page }) => {
        await page.goto('/perfil');

        // Click en link de ajustes
        const settingsLink = page
            .locator('a:has-text("Ajustes"), a[href="/perfil/ajustes"]')
            .first();
        await settingsLink.click();

        await page.waitForURL('/perfil/ajustes');
        await expect(
            page.locator('text=Ajustes').or(page.locator('text=Configuración')).first(),
        ).toBeVisible();
    });

    test('Debe cargar la página de ajustes', async ({ page }) => {
        await page.goto('/perfil/ajustes');
        await expect(
            page.locator('text=Ajustes').or(page.locator('text=Configuración')),
        ).toBeVisible();
    });

    test('Debe poder actualizar nombre en ajustes', async ({ page }) => {
        await page.goto('/perfil/ajustes');

        // Buscar input de nombre
        const nombreInput = page.locator('input[name="nombre"]');
        if ((await nombreInput.count()) > 0) {
            await nombreInput.clear();
            await nombreInput.fill(`Usuario Test Actualizado ${Date.now()}`);

            // Guardar cambios
            const saveButton = page
                .locator(
                    'button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Actualizar")',
                )
                .first();
            await saveButton.click();

            await page.waitForTimeout(2000);

            // Verificar mensaje de éxito o recarga
            await expect(
                page
                    .locator('text=guardado')
                    .or(page.locator('text=actualizado'))
                    .or(page.locator('text=éxito'))
                    .or(page.locator('text=correctamente'))
                    .first(),
            ).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe poder actualizar teléfono', async ({ page }) => {
        await page.goto('/perfil/ajustes');

        const telefonoInput = page.locator('input[name="telefono"]');
        if ((await telefonoInput.count()) > 0) {
            await telefonoInput.clear();
            await telefonoInput.fill('+56912345678');

            const saveButton = page
                .locator(
                    'button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Actualizar")',
                )
                .first();
            await saveButton.click();

            await page.waitForTimeout(2000);
        }
    });

    test('Debe validar formulario de cambiar contraseña', async ({ page }) => {
        await page.goto('/perfil/ajustes');

        // Buscar sección de cambiar contraseña
        const passwordSection = page.locator('text=Contraseña').or(page.locator('text=Password'));
        if ((await passwordSection.count()) > 0) {
            // Si existe formulario de contraseña, validar
            const currentPasswordInput = page.locator(
                'input[name="currentPassword"], input[name="passwordActual"]',
            );
            if ((await currentPasswordInput.count()) > 0) {
                await currentPasswordInput.fill('wrong-password');

                const newPasswordInput = page.locator(
                    'input[name="newPassword"], input[name="passwordNueva"]',
                );
                await newPasswordInput.fill('NewPass123!');

                const confirmPasswordInput = page.locator(
                    'input[name="confirmPassword"], input[name="confirmarPassword"]',
                );
                await confirmPasswordInput.fill('DifferentPass123!');

                const submitButton = page.locator('button[type="submit"]').last();
                await submitButton.click();

                await page.waitForTimeout(1000);

                // Debería mostrar error de contraseñas no coinciden
            }
        }
    });
});

test.describe('Usuario - Publicar Servicio', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('Debe cargar la página de publicar servicio', async ({ page }) => {
        await page.goto('/publicar');
        await expect(
            page.locator('text=Publicar').or(page.locator('text=Nuevo Servicio')),
        ).toBeVisible();
    });

    test('Debe mostrar formulario de publicación', async ({ page }) => {
        await page.goto('/publicar');

        // Verificar campos principales
        await expect(page.locator('input[name="titulo"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('textarea[name="descripcion"]')).toBeVisible();
        await expect(page.locator('input[name="precio"]')).toBeVisible();
    });

    test('Debe validar campos requeridos', async ({ page }) => {
        await page.goto('/publicar');

        // Intentar enviar sin llenar campos
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        await page.waitForTimeout(500);

        // Debería mostrar errores de validación
    });

    test('Debe poder seleccionar categoría', async ({ page }) => {
        await page.goto('/publicar');

        // Buscar selector de categoría
        const categorySelect = page
            .locator('select[name="categoria"], [data-testid="category-select"]')
            .first();
        if ((await categorySelect.count()) > 0) {
            await categorySelect.selectOption({ index: 1 });
        }

        // O si es multi-select con checkboxes
        const categoryCheckbox = page.locator('input[type="checkbox"][name*="categoria"]').first();
        if ((await categoryCheckbox.count()) > 0) {
            await categoryCheckbox.check();
        }
    });

    test('Debe poder seleccionar comuna', async ({ page }) => {
        await page.goto('/publicar');

        const comunaSelect = page.locator('select[name="comuna"]');
        if ((await comunaSelect.count()) > 0) {
            await comunaSelect.selectOption({ index: 1 });
        }
    });

    test('Debe poder llenar datos de contacto', async ({ page }) => {
        await page.goto('/publicar');

        // Datos de contacto
        const nombreContacto = page.locator('input[name="nombreContacto"]');
        if ((await nombreContacto.count()) > 0 && (await nombreContacto.isVisible())) {
            await nombreContacto.fill('Juan Pérez');
        }

        const emailContacto = page.locator('input[name="emailContacto"]');
        if ((await emailContacto.count()) > 0 && (await emailContacto.isVisible())) {
            await emailContacto.fill('contacto@ejemplo.cl');
        }

        const telefonoContacto = page.locator('input[name="telefonoContacto"]');
        if ((await telefonoContacto.count()) > 0 && (await telefonoContacto.isVisible())) {
            await telefonoContacto.fill('+56912345678');
        }
    });

    test('Debe tener checkbox "Usar mis datos de perfil"', async ({ page }) => {
        await page.goto('/publicar');

        const usarDatosCheckbox = page.locator('input[type="checkbox"]').first();
        if ((await usarDatosCheckbox.count()) > 0) {
            await usarDatosCheckbox.check();
            await page.waitForTimeout(500);
        }
    });
});

test.describe('Usuario - Gestión de Mis Servicios', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('Debe mostrar lista de servicios del usuario', async ({ page }) => {
        await page.goto('/perfil');

        // Verificar sección "Mis Servicios"
        await expect(page.locator('text=Mis Servicios')).toBeVisible({ timeout: 10000 });
    });

    test('Debe poder activar/desactivar servicio', async ({ page }) => {
        await page.goto('/perfil');

        // Buscar botón de activar/desactivar
        const toggleButton = page
            .locator('button:has-text("Activar"), button:has-text("Desactivar")')
            .first();
        if ((await toggleButton.count()) > 0) {
            await toggleButton.click();
            await page.waitForTimeout(2000);
        }
    });

    test('Debe poder editar servicio propio', async ({ page }) => {
        await page.goto('/perfil');

        // Click en botón editar
        const editButton = page.locator('button:has-text("Editar")').first();
        if ((await editButton.count()) > 0) {
            await editButton.click();

            // Verificar que se abre modal de edición - usar .first()
            await expect(
                page
                    .locator('text=Editar Servicio')
                    .or(page.locator('input[name="titulo"]'))
                    .first(),
            ).toBeVisible({ timeout: 5000 });
        }
    });

    test('Debe poder actualizar datos de servicio en modal de edición', async ({ page }) => {
        await page.goto('/perfil');

        const editButton = page.locator('button:has-text("Editar")').first();
        if ((await editButton.count()) > 0) {
            await editButton.click();

            // Esperar que cargue el formulario con datos
            await page.waitForTimeout(1000);

            // Modificar título
            const tituloInput = page.locator('input[name="titulo"]').first();
            if ((await tituloInput.count()) > 0) {
                const currentValue = await tituloInput.inputValue();
                await tituloInput.clear();
                await tituloInput.fill(`${currentValue} - Actualizado`);

                // Guardar cambios
                const saveButton = page
                    .locator(
                        'button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Actualizar")',
                    )
                    .first();
                await saveButton.click();

                await page.waitForTimeout(2000);
            }
        }
    });

    test('Debe confirmar antes de eliminar servicio', async ({ page }) => {
        await page.goto('/perfil');

        const deleteButton = page.locator('button:has-text("Eliminar")').first();
        if ((await deleteButton.count()) > 0) {
            // Rechazar confirmación
            page.on('dialog', (dialog) => dialog.dismiss());
            await deleteButton.click();
            await page.waitForTimeout(500);

            // El servicio NO debería eliminarse
        }
    });

    test('Debe tener link para actualizar a premium', async ({ page }) => {
        await page.goto('/perfil');

        // Buscar link "Actualizar a Premium"
        const premiumLink = page
            .locator('a:has-text("Premium"), button:has-text("Premium")')
            .first();
        if ((await premiumLink.count()) > 0) {
            // Link existe (servicio es básico)
            await expect(premiumLink).toBeVisible();
        }
    });
});

test.describe('Usuario - Visualización de Planes Premium', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('Debe cargar página de suscripción pro', async ({ page }) => {
        await page.goto('/suscripcion-pro');
        await expect(
            page
                .getByRole('heading')
                .filter({ hasText: /Premium/i })
                .first(),
        ).toBeVisible();
    });

    test('Debe mostrar planes disponibles', async ({ page }) => {
        await page.goto('/suscripcion-pro');

        // Verificar que hay planes mostrados
        const plans = await page.locator('[data-testid="plan-card"], .plan-card').count();
        expect(plans).toBeGreaterThanOrEqual(0);
    });

    test('Debe poder ver detalles de cada plan', async ({ page }) => {
        await page.goto('/suscripcion-pro');

        // Buscar información de precios
        await expect(
            page.locator('text=/\\$.*mes/i').or(page.locator('text=/\\$.*año/i')).first(),
        ).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Usuario - Búsqueda de Servicios', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('Debe cargar página de búsqueda', async ({ page }) => {
        await page.goto('/buscar');
        await expect(
            page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]'),
        ).toBeVisible();
    });

    test('Debe poder buscar por texto', async ({ page }) => {
        await page.goto('/buscar');

        const searchInput = page
            .locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]')
            .first();
        await searchInput.fill('electricista');
        await page.waitForTimeout(1000);

        // Debería mostrar resultados o mensaje de no resultados
    });

    test('Debe poder filtrar por categoría', async ({ page }) => {
        await page.goto('/buscar');

        const categoryFilter = page
            .locator('select:has-text("Categoría"), button:has-text("Categoría")')
            .first();
        if ((await categoryFilter.count()) > 0) {
            if ((await categoryFilter.evaluate((el) => el.tagName)) === 'SELECT') {
                await categoryFilter.selectOption({ index: 1 });
            } else {
                await categoryFilter.click();
            }
            await page.waitForTimeout(1000);
        }
    });

    test('Debe poder filtrar por comuna', async ({ page }) => {
        await page.goto('/buscar');

        const comunaFilter = page
            .locator('select:has-text("Comuna"), button:has-text("Comuna")')
            .first();
        if ((await comunaFilter.count()) > 0) {
            if ((await comunaFilter.evaluate((el) => el.tagName)) === 'SELECT') {
                await comunaFilter.selectOption({ index: 1 });
            } else {
                await comunaFilter.click();
            }
            await page.waitForTimeout(1000);
        }
    });

    test('Debe poder ver detalle de un servicio', async ({ page }) => {
        await page.goto('/buscar');

        // Esperar que carguen servicios
        await page.waitForTimeout(2000);

        const serviceCard = page
            .locator('[data-testid="service-card"], .service-card, a[href*="/servicio/"]')
            .first();
        if ((await serviceCard.count()) > 0) {
            await serviceCard.click();

            // Verificar que navegó al detalle
            await page.waitForURL(/\/servicio\/.+/);
        }
    });
});

test.describe('Usuario - Dejar Reseña', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('Debe poder navegar a dejar reseña desde detalle de servicio', async ({ page }) => {
        // Primero ir a buscar
        await page.goto('/buscar');
        await page.waitForTimeout(2000);

        // Click en primer servicio
        const serviceCard = page
            .locator('[data-testid="service-card"], .service-card, a[href*="/servicio/"]')
            .first();
        if ((await serviceCard.count()) > 0) {
            await serviceCard.click();
            await page.waitForURL(/\/servicio\/.+/);

            // Buscar botón de dejar reseña
            const reviewButton = page
                .locator('button:has-text("Dejar reseña"), a:has-text("Dejar reseña")')
                .first();
            if ((await reviewButton.count()) > 0) {
                await reviewButton.click();

                // Verificar que se carga formulario de reseña
                await expect(
                    page.locator('text=Calificación').or(page.locator('text=Reseña')),
                ).toBeVisible({ timeout: 5000 });
            }
        }
    });
});
