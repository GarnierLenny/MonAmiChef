import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';

// Create and cache the NestJS app for e2e tests
let testApp: INestApplication | null = null;

export async function getTestApp(): Promise<INestApplication> {
  if (testApp) {
    return testApp;
  }

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  testApp = moduleFixture.createNestApplication();

  // Apply same middleware as production
  testApp.use(cookieParser());

  await testApp.init();

  return testApp;
}

export async function closeTestApp(): Promise<void> {
  if (testApp) {
    await testApp.close();
    testApp = null;
  }
}

// Export the HTTP server for supertest
export async function getTestServer() {
  const app = await getTestApp();
  return app.getHttpServer();
}
