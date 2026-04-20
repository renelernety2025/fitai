FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Strip root-level mobile deps (react 19, expo, react-native) that conflict
# with apps/web react 18. Only workspace install for web + shared is needed.
RUN node -e "\
  const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));\
  delete p.dependencies;\
  require('fs').writeFileSync('package.json',JSON.stringify(p,null,2));"

RUN npm install --workspace=@fitai/web --workspace=@fitai/shared

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
