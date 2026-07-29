# Imagen de DESARROLLO del backend NestJS.
# Pensada para usarse con el bind mount de docker-compose (hot-reload vía `nest start --watch`).
# Contexto de build: raíz del workspace (monorepo pnpm).

FROM node:24.17-slim

# openssl → requerido por los engines de Prisma
# python3/make/g++ → compilación nativa de bcrypt
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

# El postinstall de backend corre `prisma generate`, que necesita el schema
# y la config presentes antes del install.
COPY backend/prisma.config.ts backend/
COPY backend/prisma/ backend/prisma/

RUN pnpm install --frozen-lockfile --filter backend --filter frontend

# --- Código fuente (en dev queda tapado por el bind mount del compose) ---
COPY . .

EXPOSE 4000

CMD ["pnpm", "--filter", "backend", "dev"]
