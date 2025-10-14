import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import type { App as SupertestApp } from 'supertest/types';
import passport from 'passport';
import hbsDefault from 'hbs';
import { join } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

describe('Auth flow (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  const adminEmail = 'e2e@example.com';
  const adminPassword = 'e2epass';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Minimal app wiring to match main.ts for rendering/session/passport
    const candidates = [
      join(process.cwd(), 'src', 'views'),
      join(__dirname, '..', 'src', 'views'),
      join(__dirname, '..', 'views'),
      join(__dirname, 'views'),
      join(process.cwd(), 'dist', 'src', 'views'),
    ];
    const viewsDir = candidates.find((p) => existsSync(p));
    if (viewsDir) app.setBaseViewsDir(viewsDir);
    app.setViewEngine('hbs');
    // Register partials similar to main.ts so views render in tests
    if (viewsDir && existsSync(join(viewsDir, 'partials'))) {
      const hbs = hbsDefault as unknown as { registerPartials: (p: string) => void };
      hbs.registerPartials(join(viewsDir, 'partials'));
    }

    const server = app.getHttpAdapter().getInstance() as unknown as express.Express;
    server.use(express.urlencoded({ extended: true }));
    server.use(express.static(join(process.cwd(), 'public')));
    const sessionMiddleware = session as unknown as (
      options: session.SessionOptions,
    ) => express.RequestHandler;
    server.use(
      sessionMiddleware({
        secret: process.env.SESSION_SECRET || 'test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    const p = passport as unknown as {
      initialize: () => express.RequestHandler;
      session: () => express.RequestHandler;
    };
    server.use(p.initialize());
    server.use(p.session());

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();

    prisma = new PrismaClient();
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await (prisma as unknown as { user: { upsert: (args: any) => Promise<any> } }).user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, role: 'ADMIN' },
      create: { email: adminEmail, passwordHash, role: 'ADMIN' },
    });
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await app?.close();
  });

  it('redirects unauthenticated users to login with next param', async () => {
    const res = await request(app.getHttpServer() as unknown as SupertestApp)
      .get('/clients')
      .expect(302);
    expect(res.header.location).toMatch(/\/auth\/login\?next=/);
  });

  it('logs in and can access protected pages; logout locks them again', async () => {
    const agent = request.agent(app.getHttpServer() as unknown as SupertestApp);
    // Login and redirect to /clients
    const loginRes = await agent
      .post('/auth/login')
      .type('form')
      .send({ email: adminEmail, password: adminPassword, next: '/clients' })
      .expect(302);
    expect(loginRes.header.location).toBe('/clients');

    // Now /clients should be accessible
    await agent.get('/clients').expect(200);

    // Logout
    const logoutRes = await agent.post('/auth/logout').expect(302);
    expect(logoutRes.header.location).toBe('/auth/login');

    // Access should be redirected again
    const afterLogout = await agent.get('/clients').expect(302);
    expect(afterLogout.header.location).toMatch(/\/auth\/login\?next=/);
  });
});
