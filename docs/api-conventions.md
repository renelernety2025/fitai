# FitAI API Conventions

Canonical reference for every NestJS endpoint. Enforced by `scripts/check-api-conventions.sh` (runs in CI).

## TL;DR

Every endpoint MUST have:

1. **`@UseGuards(JwtAuthGuard)`** — controller-level or method-level. Public endpoints (health, public catalog) explicitly comment why.
2. **DTO class** for every `@Body()` and complex `@Query()` — no inline types, no `string` / `number` / `any`.
3. **`@Throttle(...)`** on every endpoint that calls Claude, OpenAI, ElevenLabs, AWS Vision, or external HTTP.
4. **Ownership check** in the service layer (`if (resource.userId !== userId) throw new ForbiddenException()`).
5. **Throttle key** must be one of: `default`, `short`, `medium`, `long` (registered in `app.module.ts`). Any other key is silently a no-op.

## Controller template

```ts
// apps/api/src/<module>/<module>.controller.ts
import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';

@Controller('example')
@UseGuards(JwtAuthGuard)
export class ExampleController {
  constructor(private service: ExampleService) {}

  @Get(':id')
  getOne(@Request() req: any, @Param('id') id: string) {
    return this.service.getOne(id, req.user.id);
  }

  // Per-method @Throttle for AI/expensive endpoints. Pick reasonable budget:
  //   - User-facing list/CRUD: medium (200/min) — usually inherited from global
  //   - Claude Haiku call:     10–30/hour per user
  //   - Claude Sonnet vision:  3–10/hour per user
  //   - ElevenLabs TTS:        30/hour per user
  @Throttle({ default: { limit: 10, ttl: seconds(3600) } })
  @Post()
  create(@Request() req: any, @Body() dto: CreateExampleDto) {
    return this.service.create(req.user.id, dto);
  }
}
```

## DTO template

```ts
// apps/api/src/<module>/dto/create-example.dto.ts
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsInt()
  @Min(0)
  @Max(1000)
  amount: number;
}
```

Required class-validator decorators by type:
- **string**: `@IsString()` + `@MaxLength(N)` (always, prevents DoS)
- **number/int**: `@IsNumber()` / `@IsInt()` + `@Min(low)` + `@Max(high)`
- **uuid**: `@IsUUID()` (rejects arbitrary strings)
- **array**: `@IsArray()` + `@ArrayMaxSize(N)` + `@ValidateNested({ each: true })` + `@Type(() => ChildDto)`
- **enum**: `@IsIn([...])` or `@IsEnum(MyEnum)`

## Service ownership template

```ts
// apps/api/src/<module>/<module>.service.ts
async getOne(id: string, userId: string) {
  const resource = await this.prisma.example.findUnique({ where: { id } });
  if (!resource) throw new NotFoundException('Not found');
  if (resource.userId !== userId) throw new ForbiddenException();
  return resource;
}
```

For atomic XP/credit/economy operations:

```ts
// Atomic balance check + deduction (prevents race conditions on concurrent requests)
const debit = await this.prisma.userProgress.updateMany({
  where: { userId, totalXP: { gte: costXP } },
  data: { totalXP: { decrement: costXP } },
});
if (debit.count === 0) throw new BadRequestException('Not enough XP');
```

## Raw SQL

**Never `$queryRawUnsafe` / `$executeRawUnsafe`** even with positional binds. Use tagged template literals:

```ts
import { Prisma } from '@prisma/client';

// Vector similarity (pgvector)
const rows = await this.prisma.$queryRaw`
  SELECT id FROM "Exercise"
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> ${vectorStr}::vector
  LIMIT ${limit}
`;
```

## External URLs / SSRF

User-supplied URLs that the backend fetches MUST validate hostname against a private-network blocklist before any HTTP call.
See `apps/api/src/content/content.service.ts:isPrivateHostname` for the reference implementation (rejects localhost, 10/8, 172.16/12, 192.168/16, 169.254/16 AWS metadata, IPv6 link-local).

## Webhooks

Third-party webhooks (SNS, Stripe, GitHub) MUST authenticate:
- **SNS**: shared-secret in `?secret=` query param (interim) → full `sns-validator` signature verification (target).
- **Stripe**: `stripe.webhooks.constructEvent` with signing secret (future).

NEVER trust the request body alone — the body shape can be reproduced by any unauthenticated caller.

## Pre-commit (optional)

Wire `scripts/check-api-conventions.sh` into `.husky/pre-commit` if you want local enforcement:

```sh
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npm run lint:conventions
npm run lint:docs
```

## CI enforcement

Both checks run on every PR via `.github/workflows/ci.yml`:
- `bash scripts/check-api-conventions.sh` — must pass (exit 0)
- `bash scripts/verify-docs-integrity.sh` — must pass

Add intentional exceptions to `scripts/check-api-conventions.ignore` (one exact match line per ignore, with comment above explaining why).
