import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt';

type Role = 'ADMIN' | 'USER';
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private get userModel(): {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
  } {
    // Access via index but keep a narrowed type
    const m: unknown = (this.prisma as unknown as { user: unknown }).user;
    return m as {
      findUnique: (args: { where: Record<string, unknown> }) => Promise<UserRecord | null>;
      create: (args: { data: Record<string, unknown> }) => Promise<UserRecord>;
      update: (args: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => Promise<UserRecord>;
    };
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const res = await this.userModel.findUnique({ where: { email } });
    return (res ?? null) as UserRecord | null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const res = await this.userModel.findUnique({ where: { id } });
    return (res ?? null) as UserRecord | null;
  }

  async createUser(email: string, password: string, role: Role = 'USER'): Promise<UserRecord> {
    const passwordHash = await bcryptHash(password, 12); // Hash the password
    const res = await this.userModel.create({ data: { email, passwordHash, role } });
    return res as UserRecord;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    const ok = await bcryptCompare(password, hash);
    return Boolean(ok);
  }
}
