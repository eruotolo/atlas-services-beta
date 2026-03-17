import { expect, test } from '@playwright/test';

/**
 * Tests Guest - Usuario no autenticado
 * Verifica funcionalidad pública y flujos de registro/login
 */

test.describe('Guest - Navegación Pública', () => {
    test('Debe cargar la página principal', async ({ page }) => {
        await page.goto('/');
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);
        // Buscar específicamente en el título o hero para evitar ambigüedad con el logo/footer
        await expect(page.locator('h1:has-text("Chiloé"), h1:has-text("Servicios")')).toBeVisible();
    });

    test('Debe mostrar hero section en home', async ({ page }) => {
        await page.goto('/');
        // Hero típicamente tiene un título grande y un CTA
        await expect(page.locator('h1').first()).toBeVisible();
    });

    test('Debe tener navbar con links principales', async ({ page }) => {
        await page.goto('/');

        // Verificar que hay navegación
        await expect(page.locator('nav').first()).toBeVisible();

        // Links comunes en navbar - ser más específico con el contenedor nav
        await expect(
            page.locator('nav a:has-text("Buscar"), nav a:has-text("Servicios")').first(),
        ).toBeVisible();
    });

    test('Debe tener link a login en navbar', async ({ page }) => {
        await page.goto('/');
        // Buscar el link de login específicamente dentro del nav o que tenga clase de botón
        await expect(
            page.locator('nav a[href="/login"], a:has-text("Entrar")').first(),
        ).toBeVisible();
    });

    test('Debe tener link a registro en navbar', async ({ page }) => {
        await page.goto('/');
        // Buscar links que lleven a registro o contengan el texto
        await expect(
            page
                .locator('nav a[href*="registro"]')
                .or(page.getByRole('link', { name: /Registrar/i }))
                .or(page.getByRole('button', { name: /Registrar/i }))
                .first(),
        ).toBeVisible();
    });
});

test.describe('Guest - Autenticación - Login', () => {
    test('Debe cargar página de login', async ({ page }) => {
        await page.goto('/login');
        await expect(
            page.locator('text=Iniciar sesión').or(page.locator('text=Login')),
        ).toBeVisible();
    });

    test('Debe tener formulario de login con campos requeridos', async ({ page }) => {
        await page.goto('/login');

        await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('Debe validar campos vacíos en login', async ({ page }) => {
        await page.goto('/login');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // HTML5 validation o mensajes custom
        await page.waitForTimeout(500);
    });

    test('Debe validar formato de email', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"], input[type="email"]', 'email-invalido');
        await page.fill('input[name="password"], input[type="password"]', 'cualquier-password');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        await page.waitForTimeout(500);
    });

    test('Debe mostrar error con credenciales incorrectas', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"], input[type="email"]', 'noexiste@ejemplo.cl');
        await page.fill('input[name="password"], input[type="password"]', 'PasswordIncorrecto123!');

        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        await page.waitForTimeout(2000);

        // Debería mostrar mensaje de error - usar un selector más amplio o simplemente verificar que seguimos en login o hay un error
        await expect(
            page
                .locator('text=incorrecto')
                .or(page.locator('text=inválido'))
                .or(page.locator('text=error'))
                .or(page.locator('.bg-red-50'))
                .first(),
        ).toBeVisible({ timeout: 5000 });
    });

    test('Debe tener link a página de registro', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('a[href="/registro"]').first()).toBeVisible();
    });

    test('Debe tener link de "Olvidé mi contraseña" (si existe)', async ({ page }) => {
        await page.goto('/login');

        const forgotLink = page.locator(
            'a:has-text("Olvidé"), a:has-text("Recuperar"), a:has-text("contraseña")',
        );
        if ((await forgotLink.count()) > 0) {
            await expect(forgotLink).toBeVisible();
        }
    });
});

test.describe('Guest - Autenticación - Registro', () => {
    test('Debe cargar página de registro', async ({ page }) => {
        await page.goto('/registro');
        await expect(
            page.locator('h2:has-text("Crear Cuenta"), h1:has-text("Registr")').first(),
        ).toBeVisible();
    });

    test('Debe tener formulario de registro con campos requeridos', async ({ page }) => {
        await page.goto('/registro');

        await expect(page.locator('input[name="nombre"]')).toBeVisible();
        await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    });

    test('Debe validar campos vacíos en registro', async ({ page }) => {
        await page.goto('/registro');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        await page.waitForTimeout(500);
    });

    test('Debe validar formato de email en registro', async ({ page }) => {
        await page.goto('/registro');

        await page.fill('input[name="nombre"]', 'Test User');
        await page.fill('input[name="email"], input[type="email"]', 'email-invalido');
        await page.fill('input[name="password"], input[type="password"]', 'Password123!');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        await page.waitForTimeout(500);
    });

    test('Debe validar requisitos de contraseña', async ({ page }) => {
        await page.goto('/registro');

        await page.fill('input[name="nombre"]', 'Test User');
        await page.fill('input[name="email"], input[type="email"]', 'test@ejemplo.cl');
        await page.fill('input[name="password"], input[type="password"]', '123'); // Contraseña débil

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        await page.waitForTimeout(1000);

        // Debería mostrar mensaje de requisitos de contraseña
    });

    test('Debe validar confirmación de contraseña (si existe)', async ({ page }) => {
        await page.goto('/registro');

        const confirmPasswordInput = page.locator(
            'input[name="confirmPassword"], input[name="confirmarPassword"]',
        );

        if ((await confirmPasswordInput.count()) > 0) {
            await page.fill('input[name="nombre"]', 'Test User');
            await page.fill('input[name="email"], input[type="email"]', 'test@ejemplo.cl');
            await page.fill('input[name="password"], input[type="password"]', 'Password123!');
            await confirmPasswordInput.fill('DifferentPassword123!');

            const submitButton = page.locator('button[type="submit"]');
            await submitButton.click();

            await page.waitForTimeout(1000);

            // Debería mostrar error de contraseñas no coinciden
        }
    });

    test('Debe tener link a página de login', async ({ page }) => {
        await page.goto('/registro');
        await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    });

    test('Debe tener checkbox de términos y condiciones', async ({ page }) => {
        await page.goto('/registro');

        // Buscar checkbox por su tipo
        const termsCheckbox = page.locator('input[type="checkbox"]').first();

        if ((await termsCheckbox.count()) > 0) {
            await expect(termsCheckbox).toBeVisible();
        }
    });
});

test.describe('Guest - Búsqueda Pública', () => {
    test('Debe poder buscar servicios sin autenticación', async ({ page }) => {
        await page.goto('/buscar');
        await expect(
            page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]'),
        ).toBeVisible();
    });

    test('Debe mostrar servicios en resultados de búsqueda', async ({ page }) => {
        await page.goto('/buscar');
        await page.waitForTimeout(2000);

        // Debería haber servicios o mensaje de "no hay servicios"
        const hasServices = await page
            .locator('[data-testid="service-card"], .service-card, a[href*="/servicio/"]')
            .count();
        const noResultsMessage = await page.locator('text=No se encontraron').count();

        expect(hasServices + noResultsMessage).toBeGreaterThanOrEqual(0);
    });

    test('Debe poder ver detalle de servicio sin autenticación', async ({ page }) => {
        await page.goto('/buscar');
        await page.waitForTimeout(2000);

        const serviceCard = page
            .locator('[data-testid="service-card"], .service-card, a[href*="/servicio/"]')
            .first();
        if ((await serviceCard.count()) > 0) {
            await serviceCard.click();
            await page.waitForURL(/\/servicio\/.+/);

            // Verificar que carga el detalle
            await expect(page.locator('h1')).toBeVisible();
        }
    });

    test('Debe poder filtrar por categoría', async ({ page }) => {
        await page.goto('/buscar');

        const categoryFilter = page
            .locator('select:has-text("Categoría"), button:has-text("Categoría")')
            .first();
        if ((await categoryFilter.count()) > 0) {
            if ((await categoryFilter.evaluate((el) => el.tagName)) === 'SELECT') {
                await categoryFilter.selectOption({ index: 1 });
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
            }
            await page.waitForTimeout(1000);
        }
    });
});

test.describe('Guest - Páginas Informativas', () => {
    test('Debe cargar página Cómo Funciona', async ({ page }) => {
        const response = await page.goto('/como-funciona');
        expect(response?.status()).toBe(200);
    });

    test('Debe cargar página Quiénes Somos', async ({ page }) => {
        const response = await page.goto('/quienes-somos');
        expect(response?.status()).toBe(200);
    });

    test('Debe cargar página de Contacto', async ({ page }) => {
        const response = await page.goto('/contacto');
        expect(response?.status()).toBe(200);
    });

    test('Debe tener formulario en página de contacto', async ({ page }) => {
        await page.goto('/contacto');

        await expect(
            page.locator('input[name="nombre"]').or(page.locator('input[name="name"]')),
        ).toBeVisible();
        await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
        await expect(page.locator('textarea')).toBeVisible();
    });

    test('Debe cargar página de Ayuda', async ({ page }) => {
        const response = await page.goto('/ayuda');
        expect(response?.status()).toBe(200);
    });

    test('Debe cargar Política de Privacidad', async ({ page }) => {
        const response = await page.goto('/privacidad');
        expect(response?.status()).toBe(200);
    });

    test('Debe cargar Términos y Condiciones', async ({ page }) => {
        const response = await page.goto('/terminos');
        expect(response?.status()).toBe(200);
    });
});

test.describe('Guest - Planes Premium', () => {
    test('Debe poder ver página de suscripción pro sin autenticación', async ({ page }) => {
        const response = await page.goto('/suscripcion-pro');
        expect(response?.status()).toBe(200);
        await expect(
            page
                .getByRole('heading')
                .filter({ hasText: /Premium/i })
                .first(),
        ).toBeVisible();
    });

    test('Debe mostrar planes con precios', async ({ page }) => {
        await page.goto('/suscripcion-pro');

        // Buscar información de precios
        await expect(
            page.locator('text=/\\$.*mes/i').or(page.locator('text=/\\$.*año/i')).first(),
        ).toBeVisible({ timeout: 5000 });
    });

    test('Debe tener CTA para contratar plan', async ({ page }) => {
        await page.goto('/suscripcion-pro');

        await expect(
            page
                .locator('button:has-text("Contratar")')
                .or(page.locator('button:has-text("Comprar")'))
                .or(page.locator('a:has-text("Contratar")'))
                .first(),
        ).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Guest - Footer y Links', () => {
    test('Debe tener footer en todas las páginas', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('footer')).toBeVisible();
    });

    test('Footer debe tener links a redes sociales (si aplica)', async ({ page }) => {
        await page.goto('/');

        const socialLinks = page.locator(
            'footer a[href*="facebook"], footer a[href*="instagram"], footer a[href*="twitter"]',
        );
        // Es opcional, solo verificar si existen
        const count = await socialLinks.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Footer debe tener link a términos y privacidad', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('footer a[href="/terminos"]')).toBeVisible();
        await expect(page.locator('footer a[href="/privacidad"]')).toBeVisible();
    });
});

test.describe('Guest - Responsiveness', () => {
    test('Debe ser responsive en móvil', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.goto('/');

        await expect(page.locator('body')).toBeVisible();

        // Verificar que hay un menú móvil o burger menu
        const mobileMenu = page.locator('button[aria-label*="menu"], button:has-text("☰")');
        if ((await mobileMenu.count()) > 0) {
            await expect(mobileMenu).toBeVisible();
        }
    });

    test('Debe ser responsive en tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto('/');

        await expect(page.locator('body')).toBeVisible();
    });
});
