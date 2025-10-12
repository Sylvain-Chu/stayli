import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdatePasswordDto } from './dto/update-password.dto.js';

@Controller('account')
export class AccountController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async profile(@Req() req: Request, @Res() res: Response) {
    const user = (req as unknown as { user?: { id: string } }).user;
    if (!user) return res.redirect('/auth/login');
    const full = await this.users.findById(user.id);
    return res.render('account/profile', { title: 'Mon compte', user: full });
  }

  @Post('profile')
  async updateProfile(@Req() req: Request, @Res() res: Response, @Body() body: UpdateAccountDto) {
    const user = (req as unknown as { user?: { id: string } }).user;
    if (!user) return res.redirect('/auth/login');
    try {
      const { name, email } = body as unknown as { name?: string; email?: string };
      await this.users.updateProfile(user.id, {
        ...(typeof name === 'string' && name ? { name } : {}),
        ...(typeof email === 'string' && email ? { email } : {}),
      });
      return res.redirect('/account');
    } catch (err) {
      const code = (err as { code?: string }).code;
      const msg =
        code === 'EMAIL_TAKEN'
          ? 'Cet email est déjà utilisé.'
          : 'Impossible de mettre à jour le profil (email peut déjà être utilisé)';
      return res.status(400).render('account/profile', {
        title: 'Mon compte',
        user: await this.users.findById(user.id),
        error: msg,
      });
    }
  }

  @Post('password')
  async changePassword(@Req() req: Request, @Res() res: Response, @Body() body: UpdatePasswordDto) {
    const user = (req as unknown as { user?: { id: string } }).user;
    if (!user) return res.redirect('/auth/login');
    try {
      const { currentPassword, newPassword } = body as unknown as {
        currentPassword?: string;
        newPassword?: string;
      };
      await this.users.changePassword(
        user.id,
        String(currentPassword ?? ''),
        String(newPassword ?? ''),
      );
      return res.redirect('/account');
    } catch {
      return res.status(400).render('account/profile', {
        title: 'Mon compte',
        user: await this.users.findById(user.id),
        error: 'Mot de passe actuel incorrect',
      });
    }
  }
}
