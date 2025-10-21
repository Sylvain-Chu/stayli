import { Module } from '@nestjs/common';
import { I18nModule, QueryResolver, AcceptLanguageResolver, CookieResolver } from 'nestjs-i18n';
import { join } from 'path';
import { existsSync } from 'fs';
import { I18nController } from './i18n.controller';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loaderOptions: {
        path:
          [
            join(__dirname, 'i18n'),
            join(__dirname, '..', 'i18n'),
            join(process.cwd(), 'src', 'i18n'),
            join(process.cwd(), 'dist', 'src', 'i18n'),
          ].find((p) => existsSync(p)) || join(__dirname, 'i18n'),
        watch: true,
      },
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
