FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy only web and shared package definitions — skip root mobile deps
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Create minimal root package.json for workspace install (no mobile deps)
RUN echo '{"private":true,"workspaces":["apps/*","packages/*"]}' > package.json

# Install without lockfile to avoid root-level react 19 conflicts
RUN cd apps/web && npm install --legacy-peer-deps
RUN cd packages/shared && npm install 2>/dev/null || true

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

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
