# syntax=docker/dockerfile:1

# Estágio 1: deps — package*.json copiado antes do resto pra cachear o npm ci.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Estágio 2: build — não precisa de DADOS_API_URL/CLIENTES_API_URL reais (env.ts lê em
# runtime, dentro de route handler, nunca em build-time/SSG).
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN npm run build

# Estágio 3: runtime — server standalone (output: "standalone" no next.config.ts). Non-root:
# a imagem oficial do Node já vem com um usuário "node" (uid 1000), reaproveitado em vez de
# criar um novo.
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# server.js do modo standalone lê HOSTNAME do ambiente pra decidir onde bindar — Docker seta
# HOSTNAME automaticamente pro id do container, o que faz o server bindar só no IP interno dele
# (não em localhost/0.0.0.0), quebrando qualquer checagem feita de DENTRO do container (ex. o
# HEALTHCHECK abaixo), mesmo com o app acessível de fora via port-forward do Docker. Achado real.
ENV HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "server.js"]
