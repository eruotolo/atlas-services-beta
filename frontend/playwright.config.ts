import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para Testing de QA
 * Chiloé Servicios - Next.js App
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false, // Ejecutar tests en secuencia para evitar conflictos de DB
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 1,
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
    ],
    use: {
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        // Setup project - Crea estados de autenticación
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        // Tests como usuario no autenticado
        {
            name: 'chromium-guest',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /guest\.spec\.ts/,
        },
        // Tests como usuario regular autenticado
        {
            name: 'chromium-user',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /user\.spec\.ts/,
        },
        // Tests como administrador
        {
            name: 'chromium-admin',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/admin.json',
            },
            dependencies: ['setup'],
            testMatch: /admin\.spec\.ts/,
        },
        // Tests de seguridad de rutas
        {
            name: 'security',
            use: {
                ...devices['Desktop Chrome'],
            },
            dependencies: ['setup'],
            testMatch: /security\.spec\.ts/,
        },
    ],
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
