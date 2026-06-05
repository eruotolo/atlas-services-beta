# Vercel multi-cuenta — aislamiento por proyecto

Procedimiento para trabajar con **varios clientes en cuentas de Vercel distintas** sin que se mezclen.

## Concepto clave

El aislamiento entre cuentas **NO depende de dónde esté instalado el CLI**. El CLI de Vercel
guarda **un solo token global** en:

```
~/Library/Application Support/com.vercel.cli/auth.json
```

Ese archivo tiene un único token/cuenta a la vez. Por eso instalar el CLI "local" no basta:
lo que realmente aísla cuentas es el **token por proyecto** (`VERCEL_TOKEN`) y el vínculo del
proyecto (`.vercel/project.json`).

Regla práctica: **no usar `vercel login` global** como fuente de verdad. Cada proyecto define
su propio token y su propio vínculo.

## Setup por proyecto (repetir para cada cliente)

### 1. CLI como devDependency (versión fijada por proyecto)

```bash
pnpm add -D vercel
```

A partir de aquí se usa siempre con `pnpm vercel ...` (nunca un `vercel` global).

### 2. Token del cliente

Cada cliente genera su token en su propia cuenta:
**Vercel Dashboard → Settings → Tokens → Create Token** (scope: el equipo/cuenta del cliente).

Guardar ese token en el entorno del proyecto, **fuera de git**. Opciones:

- En el shell del proyecto (recomendado para comandos manuales):

  ```bash
  export VERCEL_TOKEN="<token-del-cliente>"
  ```

- O en un archivo de entorno no versionado (asegurarse de que esté en `.gitignore`).

Con `VERCEL_TOKEN` presente, el CLI y el MCP usan ese token e **ignoran el `auth.json` global**.

### 3. Vincular el proyecto a la cuenta correcta

```bash
pnpm vercel link --token "$VERCEL_TOKEN"
```

Esto crea `.vercel/project.json` (con `orgId` y `projectId` del cliente). Agregar `.vercel/`
al `.gitignore` del proyecto.

### 4. Comandos del día a día (siempre con el token del proyecto)

```bash
pnpm vercel pull --token "$VERCEL_TOKEN"          # baja env vars del proyecto
pnpm vercel deploy --token "$VERCEL_TOKEN"        # deploy preview
pnpm vercel deploy --prod --token "$VERCEL_TOKEN" # deploy producción
pnpm vercel env ls --token "$VERCEL_TOKEN"        # listar env vars
```

> Si exportaste `VERCEL_TOKEN` en el shell, puedes omitir `--token` en cada comando.

## MCP de Vercel por proyecto (opcional)

En lugar del plugin global (scope user), configurar el MCP **por proyecto** en un `.mcp.json`
local apuntando al token del cliente. Ejemplo de estructura:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "pnpm",
      "args": ["dlx", "vercel-mcp"],
      "env": {
        "VERCEL_TOKEN": "<token-del-cliente>"
      }
    }
  }
}
```

> Ajustar `command`/`args` al paquete MCP de Vercel que se use. Mantener `.mcp.json` con el
> token fuera de git si contiene el valor real; preferir referenciar una variable de entorno.

## Checklist por cliente nuevo

- [ ] `pnpm add -D vercel` en el proyecto
- [ ] Token creado en la cuenta del cliente
- [ ] `VERCEL_TOKEN` configurado en el entorno del proyecto (no en git)
- [ ] `pnpm vercel link --token "$VERCEL_TOKEN"` ejecutado
- [ ] `.vercel/` en `.gitignore`
- [ ] (Opcional) `.mcp.json` local con el MCP de Vercel del cliente

## Qué NO hacer

- No instalar el CLI de Vercel de forma global (`npm i -g vercel` / `pnpm add -g vercel`).
- No depender de `vercel login` global para elegir la cuenta.
- No commitear tokens, `.vercel/` ni `.mcp.json` con el token real.
