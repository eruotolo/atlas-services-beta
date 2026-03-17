# Fallas y Plan de Resolución - 17 de Marzo

Tras ejecutar exitosamente toda la suite de pruebas E2E con Playwright (`npm run test:e2e`), se obtuvieron **135 pruebas en total**, con **130 exitosas** y **5 fallidas**. Cabe destacar que las pruebas que fallaron en `setup` (autenticación) causaron que otras pruebas dependientes (admin y user specs) fueran omitidas (`did not run`).

## Lista de Fallas Detectadas

1. **Autenticación - User Setup (`auth.setup.ts:17`)**
   - **Error:** `TimeoutError: page.waitForURL: Timeout 10000ms exceeded. waiting for navigation to "/perfil"`
   - **Causa probable:** El proceso de Login (`/login`) no está redireccionando correctamente hacia `/perfil`, o las credenciales automáticas de la prueba fallaron al comunicarse con el backend, por lo que nunca alcanza la página y hace *timeout*.

2. **Autenticación - Admin Setup (`auth.setup.ts:42`)**
   - **Error:** `TimeoutError: page.waitForURL: Timeout 10000ms exceeded. waiting for navigation to "/perfil"`
   - **Causa probable:** Mismo problema que el punto 1, pero afectando a la cuenta del administrador. Como la sesión no se guardó, las pruebas `user.spec.ts` y `admin.spec.ts` no se ejecutaron.

3. **Navegación Pública - Navbar (`guest.spec.ts:43`)**
   - **Prueba:** "Debe tener link a registro en navbar"
   - **Error:** `element(s) not found` buscando `nav a[href*="registro"]` o botones con texto "Registrar".
   - **Causa probable:** El enlace o botón para registrarse desapareció o cambió de ruta/texto en el componente Navbar.

4. **Planes Premium - Suscripción sin Autenticación (`guest.spec.ts:334`)**
   - **Prueba:** "Debe poder ver página de suscripción pro sin autenticación"
   - **Error:** `element(s) not found` buscando un `heading` con texto `Premium`. 
   - **Causa probable:** El título en la página `/premium` o `/precios` no coincide con el texto esperado en el test, o la página no está renderizando adecuadamente (error 404/500).

5. **Planes Premium - Call-to-Action (`guest.spec.ts:354`)**
   - **Prueba:** "Debe tener CTA para contratar plan"
   - **Error:** No se encontraron botones con el texto "Contratar" o "Comprar".
   - **Causa probable:** Cambios en el texto de la interfaz gráfica de los de los planes premuim, o la lista de planes premium no está renderizando en absoluto.

---

## 🛠 Plan de Resolución

Para llegar a una estabilidad del 100%, ejecutaremos el siguiente plan paso a paso:

- [x] **Paso 1: Reparar Autenticación Base (Login a Perfil)**
  1. Examinar el comportamiento del endpoint `/login` de `next-auth` y `auth.setup.ts`. 
  2. Verificar si el servidor web local (`auth.setup.ts`) está obteniendo la base de datos correcta y las contraseñas coinciden, o si un cambio reciente en el `apiClient`/`auth.ts` rompió la redirección.
  
- [x] **Paso 2: Reparar Link de Registro en Navbar**
  1. Revisar `src/components/layout/Navbar.tsx` (o equivalente).
  2. Corregir el `<Link>` faltante para coincidir estéticamente y cumplir la prueba.

- [x] **Paso 3: Reparar Visualización de Planes Premium**
  1. Revisar la página `/planes-premium` o `/precios`.
  2. Corregir los H1/H2 y los nombres de los botones "Contratar" para que el renderizado inicial incluya dichos componentes y las pruebas lo puedan seleccionar.

- [ ] **Paso 4: Verificación Final (Re-test)**
  1. Una vez completado los arreglos del frontend y backend, volver a ejecutar `npm run test:e2e`.
  2. Cerciorarse de que las pruebas omitidas de perfil (`user` y `admin`) hayan funcionado tras arreglar los setups.
