import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from '../auth/public.decorator';

@Controller('i18n')
export class I18nController {
  @Public()
  @Get('set-language')
  setLanguage(
    @Query('lang') lang: string,
    @Query('redirect') redirect: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const validLangs = ['en', 'fr'];
    const selectedLang = validLangs.includes(lang) ? lang : 'fr';

    res.cookie('lang', selectedLang, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    });

    const redirectUrl = redirect || req.headers.referer || '/dashboard';
    res.redirect(redirectUrl);
  }
}
