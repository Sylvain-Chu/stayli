import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private users: UsersService) {
    super();
  }

  serializeUser(user: { id: string }, done: (err: unknown, id?: string) => void): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: unknown, user?: { id: string; email: string; role: string } | null) => void,
  ): Promise<void> {
    try {
      const user = await this.users.findById(id);
      if (!user) return done(null, null);
      done(null, { id: user.id, email: user.email, role: user.role });
    } catch (e) {
      done(e);
    }
  }
}
