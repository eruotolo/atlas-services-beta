# Imagen de DESARROLLO del frontend Next.js.
# Pensada para usarse con el bind mount de docker-compose (hot-reload vía `next dev`).
# Contexto de build: raíz del workspace (monorepo pnpm).

FROM node:24.17-slim

# openssl → engines de Prisma (el frontend comparte el lockfile del monorepo)
# python3/make/g++ → compilación nativa (bcrypt está en serverExternalPackages)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openssl \
        python3 \
        make \
        g++ \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

# --- Capa de dependencias (se cachea mientras no cambien los manifiestos) ---
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY appmobile/package.json appmobile/

COPY backend/prisma.config.ts backend/
COPY backend/prisma/ backend/prisma/

RUN pnpm install --frozen-lockfile --filter backend --filter frontend

# --- Código fuente (en dev queda tapado por el bind mount del compose) ---
COPY . .

EXPOSE 3333

CMD ["pnpm", "--filter", "frontend", "dev"]
