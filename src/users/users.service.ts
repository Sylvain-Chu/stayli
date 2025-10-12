import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';

type Role = 'ADMIN' | 'USER';
export interface UserRecord {
  id: string;
  name?: string;
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

  // Minimal typed wrappers around bcrypt to satisfy strict eslint rules under NodeNext
  private async bcryptCompare(data: string, encrypted: string): Promise<boolean> {
    return (bcrypt as unknown as { compare: (a: string, b: string) => Promise<boolean> }).compare(
      data,
      encrypted,
    );
  }

  private async bcryptHash(data: string, saltOrRounds: number): Promise<string> {
    return (bcrypt as unknown as { hash: (a: string, b: number) => Promise<string> }).hash(
      data,
      saltOrRounds,
    );
  }

  async updateProfile(id: string, data: { name?: string; email?: string }): Promise<UserRecord> {
    try {
      const res = await this.userModel.update({ where: { id }, data });
      return res as UserRecord;
    } catch (err) {
      // Detect Prisma unique constraint violation (P2002) for email
      const code = (err as { code?: string }).code;
      if (code === 'P2002') {
        const e = new Error('EMAIL_TAKEN');
        (e as unknown as { code: string }).code = 'EMAIL_TAKEN';
        throw e;
      }
      throw err;
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    const ok = await this.bcryptCompare(currentPassword, user.passwordHash);
    if (!ok) throw new Error('Invalid password');
    const passwordHash = await this.bcryptHash(newPassword, 12);
    await this.userModel.update({ where: { id }, data: { passwordHash } });
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
    const passwordHash = await this.bcryptHash(password, 12); // Hash the password
    const res = await this.userModel.create({ data: { email, passwordHash, role } });
    return res as UserRecord;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    const ok = await this.bcryptCompare(password, hash);
    return Boolean(ok);
  }
}
