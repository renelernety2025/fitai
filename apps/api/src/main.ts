// Sentry MUST be initialized before any other imports to hook into Node internals.
import * as Sentry from '@sentry/nestjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1, // 10% of transactions
    beforeSend(event) {
      // Drop validation errors (noisy user input) from Sentry
      if (event.exception?.values?.some((e) => e.type === 'BadRequestException')) {
        return null;
      }
      return event;
    },
  });
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  app.setGlobalPrefix('api', { exclude: ['health'] });
  const port = process.env.PORT || 3001;
  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`API running on http://localhost:${port}`);
}
bootstrap();
