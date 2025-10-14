import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('validate returns user summary when credentials ok', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'u1',
        email: 'a@b.c',
        passwordHash: 'hash',
        role: 'admin',
      }),
      validatePassword: jest.fn().mockResolvedValue(true),
    } as unknown as import('src/users/users.service').UsersService;
    const svc = new AuthService(users);
    const res = await svc.validate('a@b.c', 'pwd');
    expect(res).toEqual({ id: 'u1', email: 'a@b.c', role: 'admin' });
  });

  it('validate throws when user not found', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue(null),
      validatePassword: jest.fn(),
    } as unknown as import('src/users/users.service').UsersService;
    const svc = new AuthService(users);
    await expect(svc.validate('a@b.c', 'pwd')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('validate throws when password is wrong', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'u1',
        email: 'a@b.c',
        passwordHash: 'hash',
        role: 'user',
      }),
      validatePassword: jest.fn().mockResolvedValue(false),
    } as unknown as import('src/users/users.service').UsersService;
    const svc = new AuthService(users);
    await expect(svc.validate('a@b.c', 'pwd')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
