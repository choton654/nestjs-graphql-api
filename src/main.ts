import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session = require('express-session');
import connectRedis = require('connect-redis');
import Redis = require('ioredis');

const port = process.env.PORT || 5000;

const RedisStore = connectRedis(session);
export const redis = new Redis();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      saveUninitialized: false,
      secret: 'keyboard cat',
      resave: true,
    }),
  );

  await app.listen(port);
  Logger.log(
    ` Server running on http://localhost:${port}/graphql`,
    'Bootstrap',
  );
}
bootstrap();
