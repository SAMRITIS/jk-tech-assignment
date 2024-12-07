import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as contextService from 'request-context';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(passport.initialize());
  app.use(contextService.middleware('request'));
  app.setGlobalPrefix(configService.get<string>('globalPrefix'));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
