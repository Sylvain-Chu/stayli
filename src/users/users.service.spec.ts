import { UsersService } from './users.service';
import bcryptDefault from 'bcrypt';

// Mock bcrypt used by UsersService
jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

const bcrypt = bcryptDefault as unknown as { compare: jest.Mock; hash: jest.Mock };

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'USER';
  name?: string;
};

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    usersService = new UsersService(
      prismaMock as unknown as import('src/prisma/prisma.service').PrismaService,
    );
    bcrypt.compare.mockReset();
    bcrypt.hash.mockReset();
  });

  it('createUser hashes password and creates user', async () => {
    bcrypt.hash.mockResolvedValue('hashedpw');
    const created: UserRecord = {
      id: 'u1',
      email: 'a@b.com',
      passwordHash: 'hashedpw',
      role: 'USER',
    };
    prismaMock.user.create.mockResolvedValue(created);

    const res = await usersService.createUser('a@b.com', 'secret');
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 12);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { email: 'a@b.com', passwordHash: 'hashedpw', role: 'USER' },
    });
    expect(res).toEqual(created);
  });

  it('validatePassword returns true/false from bcrypt.compare', async () => {
    bcrypt.compare.mockResolvedValueOnce(true);
    await expect(usersService.validatePassword('a', 'b')).resolves.toBe(true);
    bcrypt.compare.mockResolvedValueOnce(false);
    await expect(usersService.validatePassword('a', 'b')).resolves.toBe(false);
  });

  it('findByEmail returns user or null', async () => {
    const user = { id: '1', email: 'x@y.z', passwordHash: 'h', role: 'USER' };
    prismaMock.user.findUnique.mockResolvedValueOnce(user);
    await expect(usersService.findByEmail('x@y.z')).resolves.toEqual(user);

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(usersService.findByEmail('no@t.found')).resolves.toBeNull();
  });

  it('findById returns user or null', async () => {
    const user: UserRecord = { id: '1', email: 'a@b.com', passwordHash: 'h', role: 'USER' };
    prismaMock.user.findUnique.mockResolvedValueOnce(user);
    await expect(usersService.findById('1')).resolves.toEqual(user);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(usersService.findById('2')).resolves.toBeNull();
  });

  it('changePassword updates password when current is valid', async () => {
    const user: UserRecord = {
      id: 'u1',
      email: 'a@b.com',
      passwordHash: 'oldhash',
      role: 'USER',
    };
    prismaMock.user.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newhash');
    prismaMock.user.update.mockResolvedValue({ ...user, passwordHash: 'newhash' });

    await usersService.changePassword('u1', 'current', 'newpass');

    expect(bcrypt.compare).toHaveBeenCalledWith('current', 'oldhash');
    expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { passwordHash: 'newhash' },
    });
  });

  it('changePassword throws on invalid current password', async () => {
    const user: UserRecord = {
      id: 'u1',
      email: 'a@b.com',
      passwordHash: 'oldhash',
      role: 'USER',
    };
    prismaMock.user.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await expect(usersService.changePassword('u1', 'bad', 'new')).rejects.toThrow(
      'Invalid password',
    );
  });

  it('changePassword throws when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(usersService.changePassword('missing', 'x', 'y')).rejects.toThrow(
      'User not found',
    );
  });

  it('updateProfile maps Prisma P2002 to EMAIL_TAKEN error', async () => {
    prismaMock.user.update.mockRejectedValue({ code: 'P2002' });
    await expect(usersService.updateProfile('u1', { email: 'x@y.z' })).rejects.toMatchObject({
      message: 'EMAIL_TAKEN',
      code: 'EMAIL_TAKEN',
    });
  });

  it('updateProfile returns updated user on success', async () => {
    const updated: UserRecord = {
      id: 'u1',
      email: 'new@y.z',
      passwordHash: 'hash',
      role: 'USER',
      name: 'New Name',
    };
    prismaMock.user.update.mockResolvedValue(updated);
    await expect(usersService.updateProfile('u1', { name: 'New Name' })).resolves.toEqual(updated);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { name: 'New Name' },
    });
  });

  it('updateProfile rethrows unknown errors', async () => {
    const err = new Error('boom') as Error & { code?: string };
    err.code = 'OTHER';
    prismaMock.user.update.mockRejectedValue(err);
    await expect(usersService.updateProfile('u1', { name: 'x' })).rejects.toBe(err);
  });
});
