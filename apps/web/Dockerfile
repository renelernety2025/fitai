FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy only web and shared package definitions
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Workspace root — only web + shared, no mobile deps that bring React 19
RUN echo '{"private":true,"workspaces":["apps/web","packages/shared"]}' > package.json

# Install with nested strategy to prevent cross-package React hoisting
RUN npm install --legacy-peer-deps --install-strategy=nested 2>/dev/null || npm install --legacy-peer-deps

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

WORKDIR /app/apps/web
RUN npm run build

FROM public.ecr.aws/docker/library/node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
