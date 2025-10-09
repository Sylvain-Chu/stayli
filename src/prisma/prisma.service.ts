import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Ensure environment variables are loaded before Prisma tries to connect.
// Prefer .env.local for host-run development (DB on localhost), fallback to .env (DB service name 'db' in Docker).
(() => {
  try {
    const localEnv = join(process.cwd(), '.env.local');
    if (existsSync(localEnv)) {
      dotenv.config({ path: localEnv, override: true });
    } else {
      dotenv.config({ override: true });
    }
  } catch {
    // no-op: if dotenv fails, Prisma will still try with process.env as-is
  }
})();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
