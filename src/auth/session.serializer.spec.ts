import { SessionSerializer } from './session.serializer';
import type { UsersService } from 'src/users/users.service';

describe('SessionSerializer', () => {
  it('serializeUser returns id', () => {
    const users = {} as unknown as UsersService;
    const s = new SessionSerializer(users);
    const done = jest.fn();
    s.serializeUser({ id: 'u1' }, done);
    expect(done).toHaveBeenCalledWith(null, 'u1');
  });

  it('deserializeUser returns user or null and handles errors', async () => {
    const users: Pick<UsersService, 'findById'> = {
      findById: jest
        .fn<Promise<import('src/users/users.service').UserRecord | null>, [string]>()
        .mockResolvedValueOnce({
          id: 'u1',
          email: 'a@b.c',
          role: 'ADMIN',
          passwordHash: 'x',
        })
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('db')),
    };
    const s = new SessionSerializer(users as unknown as UsersService);

    const done1 = jest.fn();
    await s.deserializeUser('u1', done1);
    expect(done1).toHaveBeenCalledWith(null, { id: 'u1', email: 'a@b.c', role: 'ADMIN' });

    const done2 = jest.fn();
    await s.deserializeUser('u1', done2);
    expect(done2).toHaveBeenCalledWith(null, null);

    const done3 = jest.fn<(err: unknown, user?: unknown) => void, [unknown, unknown]>();
    await s.deserializeUser('u1', done3);
    const callArgs = (done3 as unknown as jest.Mock).mock.calls[0] as [unknown, unknown];
    expect(callArgs[0]).toBeInstanceOf(Error);
  });
});
