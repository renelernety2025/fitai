# FitAI — AI-Powered Video Fitness Platform

Monorepo s Next.js frontend, NestJS backend, PostgreSQL a Redis.

## Struktura

```
fitai/
├── apps/
│   ├── web/          # Next.js 14 (App Router) frontend
│   └── api/          # NestJS backend + Prisma ORM
├── packages/
│   └── shared/       # Sdílené TypeScript typy
├── docker-compose.yml
└── turbo.json
```

## Požadavky

- Node.js 20+
- Docker & Docker Compose
- npm 10+

## Spuštění lokálně

### 1. Naklonuj repo a nainstaluj závislosti

```bash
cp .env.example .env
npm install
```

### 2. Nastartuj databázi a Redis

```bash
docker-compose up postgres redis -d
```

### 3. Spusť Prisma migrate a seed

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

### 4. Spusť dev servery

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Health check**: http://localhost:3001/health

### Alternativa: vše přes Docker

```bash
docker-compose up
```

## Databáze

Prisma schema je v `apps/api/prisma/schema.prisma`. Modely:

- **User** — uživatelé platformy
- **Video** — cvičební videa s HLS streamem a choreografií
- **WorkoutSession** — záznam cvičení s přesností póz
- **PoseSnapshot** — jednotlivé snímky póz s úhly kloubů

## Skripty

| Příkaz | Popis |
|--------|-------|
| `npm run dev` | Spustí oba dev servery (Turborepo) |
| `npm run build` | Build všech packages |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Seed databáze |
| `npm run db:studio` | Prisma Studio GUI |
