import { fetch } from 'undici'; // Built-in in Node 18+, but ensuring types/usage matches environment
// If undici isn't available, we use global fetch if on Node 18+

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const publicPaths = [
  '/',
  '/login',
  '/registro',
  '/buscar',
  '/ayuda',
  '/como-funciona',
  '/contacto',
  '/privacidad',
  '/quienes-somos',
  '/terminos',
  '/suscripcion-pro',
];

const protectedPaths = [
  '/admin',
  '/perfil',
  '/publicar'
];

async function checkUrl(path: string, expectedStatuses: number[] = [200]) {
  try {
    const url = `${BASE_URL}${path}`;
    const start = performance.now();
    const response = await fetch(url);
    const duration = (performance.now() - start).toFixed(0);
    
    const status = response.status;
    const isOk = expectedStatuses.includes(status);
    
    const icon = isOk ? '✅' : '❌';
    console.log(`${icon} ${path.padEnd(20)} Status: ${status} (${duration}ms)`);
    
    if (!isOk) {
      console.error(`   ⚠️ Expected: ${expectedStatuses.join(' or ')}, Received: ${status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`❌ ${path.padEnd(20)} Error: ${(error as Error).message}`);
    return false;
  }
}

async function runSmokeTest() {
  console.log(`🚀 Iniciando Smoke Test en ${BASE_URL}...
`);
  
  let passed = 0;
  let failed = 0;

  console.log('--- Rutas Públicas (Esperando 200 OK) ---');
  for (const path of publicPaths) {
    const success = await checkUrl(path, [200]);
    if (success) passed++; else failed++;
  }

  console.log('\n--- Rutas Protegidas (Esperando Redirección 307/308 o Auth Check) ---');
  // Next.js redirects are often 307. Or if middleware intercepts, it might return content (200) of login page.
  // Assuming non-authed user gets redirected to /login (which gives 200) or gets a 307 redirect response depending on how fetch handles it.
  // Standard fetch follows redirects automatically. So requesting /admin might eventually give 200 (login page) or 401/403.
  // We'll pass `redirect: 'manual'` to check for the redirect explicitly if we wanted, but simple fetch follows.
  // Let's assume if we get 200 (Login Page) or 307/308 it's "Working" (not crashing 500).
  for (const path of protectedPaths) {
     const url = `${BASE_URL}${path}`;
     try {
         const response = await fetch(url, { redirect: 'manual' });
         const status = response.status;
         // 307/308 = Redirect (Good)
         // 200 = Rendered something (maybe login page directly if no redirect? Good)
         // 401/403 = Access Denied (Good)
         // 500 = Error (Bad)
         const isOk = status < 500;
         const icon = isOk ? '✅' : '❌';
         console.log(`${icon} ${path.padEnd(20)} Status: ${status}`);
         if(isOk) passed++; else failed++;
     } catch (e) {
         console.error(`❌ ${path} Error: ${(e as Error).message}`);
         failed++;
     }
  }

  console.log('\n----------------------------------------');
  console.log(`🏁 Resultados: ${passed} Pasados, ${failed} Fallados`);
  
  if (failed > 0) {
    console.log('⚠️  Algunas rutas fallaron. Revisa los logs.');
    process.exit(1);
  } else {
    console.log('✨ Todo parece estar funcionando correctamente.');
    process.exit(0);
  }
}

runSmokeTest();
