import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Trust proxy (for Railway, Heroku, etc.)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  expressApp.disable('etag');

  // CORS Configuration
  const ALLOWED_ORIGINS = [
    process.env.FRONTEND_ORIGIN,
    process.env.CORS_ORIGIN,
    'https://www.monamichef.com',
    'https://monamichef.com',
    'http://localhost:8080',
    'http://localhost:3000',
  ].filter(Boolean) as string[];

  console.log('[BOOT] Environment FRONTEND_ORIGIN:', process.env.FRONTEND_ORIGIN);
  console.log('[BOOT] Environment CORS_ORIGIN:', process.env.CORS_ORIGIN);
  console.log('[BOOT] Allowed CORS origins:', ALLOWED_ORIGINS);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log('[CORS] Request from origin:', origin);

      // Allow non-browser requests (curl/health) where origin is undefined
      if (!origin) {
        console.log('[CORS] Allowing request with no origin (server-to-server)');
        return callback(null, true);
      }

      const ok = ALLOWED_ORIGINS.includes(origin);
      if (ok) {
        console.log('[CORS] ✅ Allowed origin:', origin);
      } else {
        console.warn(
          '[CORS] ❌ Blocked origin:',
          origin,
          '- Not in allowed list:',
          ALLOWED_ORIGINS,
        );
      }
      callback(null, ok);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Cookie'],
  });

  // Cookie parser
  app.use(cookieParser());

  // Global Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('MonAmiChef API')
    .setDescription('MonAmiChef meal planning and AI cooking assistant API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health', 'Health check endpoints')
    .addTag('Authentication', 'User and guest authentication')
    .addTag('Chat', 'AI cooking assistant chat')
    .addTag('Recipe', 'Recipe management')
    .addTag('MealPlans', 'Meal planning')
    .addTag('GroceryList', 'Grocery list management')
    .addTag('UserHealth', 'User health metrics and goals')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start server
  const port = Number(process.env.PORT) || 8888;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 MonAmiChef API listening on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/docs`);
}

bootstrap();
