import { redis } from './main';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs/mikro-orm.module';
import RepoModule from './repo.module';
import config from './mikro-orm.config';
import { TypeGraphQLModule } from 'typegraphql-nestjs';
import { MyContext } from './types';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { logger } from '@mikro-orm/nestjs';
import { Updoot } from './entity/updoot.entity';
import { User } from './entity/user.entity';
import { Post } from './entity/post.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeGraphQLModule.forRoot({
      emitSchemaFile: true,
      validate: false,
      dateScalarMode: 'timestamp',
      debug: true,
      playground: true,
      context: ({ req, res }): MyContext => ({ req, res, redis }),
      cors: {
        credentials: true,
        origin: 'http://localhost:3000',
      },
    }),
    MikroOrmModule.forRoot({
      clientUrl: process.env.MONGO_URI,
      entities: [Post, User, Updoot],
      dbName: 'lireddit',
      type: 'mongo',
      debug: true,
      logger: logger.log.bind(logger),
      highlighter: new MongoHighlighter(),
    }),
    RepoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// GraphQLModule.forRootAsync({
//   useClass: GraphqlConfigService,
// }),

// GraphQLModule.forRoot({
//   autoSchemaFile: 'schema.gql',
//   playground: true,
//   installSubscriptionHandlers: true,
//   context: ({ req, res }): MyContext => ({ req, res, redis }),
//   cors: {
//     credentials: true,
//     origin: 'http://localhost:3000',
//   },
// }),

// TypeOrmModule.forRoot({
//   type: 'mongodb',
//   url: process.env.MONGO_URI,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   synchronize: true,
//   logging: true,
//   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
// }),
