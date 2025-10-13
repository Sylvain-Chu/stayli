import { UsersService } from './users.service';

// Mock bcrypt used by UsersService
jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'USER';
  name?: string;
};

describe('UsersService', () => {
  const bcrypt = require('bcrypt').default as { compare: jest.Mock; hash: jest.Mock };

  let usersService: UsersService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    usersService = new UsersService(prismaMock);
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

  it('updateProfile maps Prisma P2002 to EMAIL_TAKEN error', async () => {
    prismaMock.user.update.mockRejectedValue({ code: 'P2002' });
    await expect(usersService.updateProfile('u1', { email: 'x@y.z' })).rejects.toMatchObject({
      message: 'EMAIL_TAKEN',
      code: 'EMAIL_TAKEN',
    });
  });
});
