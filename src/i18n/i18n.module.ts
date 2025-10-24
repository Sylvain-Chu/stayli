import { Module } from '@nestjs/common';
import { I18nModule, QueryResolver, AcceptLanguageResolver, CookieResolver } from 'nestjs-i18n';
import { join } from 'path';
import { existsSync } from 'fs';
import { I18nController } from './i18n.controller';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loaderOptions: (() => {
        // Prefer common locations, but only use ones that actually exist.
        const candidates = [
          join(__dirname, '..', 'i18n'),
          join(process.cwd(), 'src', 'i18n'),
          join(process.cwd(), 'dist', 'src', 'i18n'),
          join(__dirname, 'i18n'),
        ];
        const found = candidates.find((p) => existsSync(p));
        // Fallback to src/i18n which should exist in development.
        const pathToUse = found ?? join(process.cwd(), 'src', 'i18n');
        return { path: pathToUse, watch: true };
      })(),
      resolvers: [
        new QueryResolver(['lang', 'locale']),
        new CookieResolver(['lang', 'locale']),
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [I18nController],
  exports: [I18nModule],
})
export class I18nConfigModule {}
