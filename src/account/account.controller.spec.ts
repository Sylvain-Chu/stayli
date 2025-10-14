import { AccountController } from './account.controller';
import type { UsersService } from 'src/users/users.service';
import type { Request, Response } from 'express';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

type MockRes = {
  status: jest.Mock<MockRes, [number]>;
  render: jest.Mock<void, [string, Record<string, unknown>]>;
  redirect: jest.Mock<void, [string]>;
};

function makeRes(): MockRes {
  const status = jest.fn<MockRes, [number]>();
  const render = jest.fn<void, [string, Record<string, unknown>]>();
  const redirect = jest.fn<void, [string]>();
  const res: MockRes = { status, render, redirect };
  status.mockImplementation(() => res);
  return res;
}

function makeReq(user?: { id: string }, body?: Record<string, unknown>): Request {
  return { user, body } as unknown as Request;
}

describe('AccountController', () => {
  let users: {
    findById: jest.Mock<Promise<unknown>, [string]>;
    updateProfile: jest.Mock<Promise<void>, [string, { name?: string; email?: string }]>;
    changePassword: jest.Mock<Promise<void>, [string, string, string]>;
  };
  let controller: AccountController;

  beforeEach(() => {
    users = {
      findById: jest.fn<Promise<unknown>, [string]>(),
      updateProfile: jest.fn<Promise<void>, [string, { name?: string; email?: string }]>(),
      changePassword: jest.fn<Promise<void>, [string, string, string]>(),
    };
    controller = new AccountController(users as unknown as UsersService);
  });

  it('GET /account redirects to login when not authenticated', async () => {
    const res = makeRes();
    await controller.profile(makeReq(undefined), res as unknown as Response);
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('GET /account renders profile when authenticated', async () => {
    const res = makeRes();
    users.findById.mockResolvedValue({ id: 'u1', email: 'a@b.c' });
    await controller.profile(makeReq({ id: 'u1' }), res as unknown as Response);
    expect(res.render).toHaveBeenCalledWith(
      'account/profile',
      expect.objectContaining({ title: 'Mon compte', user: { id: 'u1', email: 'a@b.c' } }),
    );
  });

  it('POST /account/profile redirects to login when not authenticated', async () => {
    const res = makeRes();
    const dto = Object.assign(new UpdateAccountDto(), { name: 'X', email: 'x@y.z' });
    await controller.updateProfile(
      makeReq(undefined, { name: 'X', email: 'x@y.z' }),
      res as unknown as Response,
      dto,
    );
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('POST /account/profile updates and redirects on success', async () => {
    const res = makeRes();
    const dto = Object.assign(new UpdateAccountDto(), { name: 'X', email: 'x@y.z' });
    await controller.updateProfile(
      makeReq({ id: 'u1' }, { name: 'X', email: 'x@y.z' }),
      res as unknown as Response,
      dto,
    );
    expect(users.updateProfile).toHaveBeenCalledWith('u1', { name: 'X', email: 'x@y.z' });
    expect(res.redirect).toHaveBeenCalledWith('/account');
  });

  it('POST /account/profile handles EMAIL_TAKEN error', async () => {
    const res = makeRes();
    users.updateProfile.mockRejectedValueOnce(
      Object.assign(new Error('EMAIL_TAKEN'), { code: 'EMAIL_TAKEN' }),
    );
    users.findById.mockResolvedValue({ id: 'u1', email: 'a@b.c' });
    const dto = Object.assign(new UpdateAccountDto(), { name: 'X', email: 'x@y.z' });
    await controller.updateProfile(
      makeReq({ id: 'u1' }, { name: 'X', email: 'x@y.z' }),
      res as unknown as Response,
      dto,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith(
      'account/profile',
      expect.objectContaining({
        title: 'Mon compte',
        user: { id: 'u1', email: 'a@b.c' },
        error: 'Cet email est déjà utilisé.',
      }),
    );
  });

  it('POST /account/profile handles generic update error', async () => {
    const res = makeRes();
    users.updateProfile.mockRejectedValueOnce(Object.assign(new Error('OTHER'), { code: 'OTHER' }));
    users.findById.mockResolvedValue({ id: 'u1', email: 'a@b.c' });
    const dto = Object.assign(new UpdateAccountDto(), { name: 'X' });
    await controller.updateProfile(
      makeReq({ id: 'u1' }, { name: 'X' }),
      res as unknown as Response,
      dto,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith(
      'account/profile',
      expect.objectContaining({
        title: 'Mon compte',
        user: { id: 'u1', email: 'a@b.c' },
        error: 'Impossible de mettre à jour le profil (email peut déjà être utilisé)',
      }),
    );
  });

  it('POST /account/password redirects to login when not authenticated', async () => {
    const res = makeRes();
    const dto = Object.assign(new UpdatePasswordDto(), {
      currentPassword: 'old',
      newPassword: 'new',
    });
    await controller.changePassword(
      makeReq(undefined, { currentPassword: 'old', newPassword: 'new' }),
      res as unknown as Response,
      dto,
    );
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('POST /account/password updates password and redirects on success', async () => {
    const res = makeRes();
    const dto = Object.assign(new UpdatePasswordDto(), {
      currentPassword: 'old',
      newPassword: 'new',
    });
    await controller.changePassword(
      makeReq({ id: 'u1' }, { currentPassword: 'old', newPassword: 'new' }),
      res as unknown as Response,
      dto,
    );
    expect(users.changePassword).toHaveBeenCalledWith('u1', 'old', 'new');
    expect(res.redirect).toHaveBeenCalledWith('/account');
  });

  it('POST /account/password renders error when current password invalid', async () => {
    const res = makeRes();
    users.changePassword.mockRejectedValueOnce(new Error('bad'));
    users.findById.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    const dto = Object.assign(new UpdatePasswordDto(), {
      currentPassword: 'old',
      newPassword: 'new',
    });
    await controller.changePassword(
      makeReq({ id: 'u1' }, { currentPassword: 'old', newPassword: 'new' }),
      res as unknown as Response,
      dto,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith(
      'account/profile',
      expect.objectContaining({
        title: 'Mon compte',
        user: { id: 'u1', email: 'a@b.c' },
        error: 'Mot de passe actuel incorrect',
      }),
    );
  });
});
