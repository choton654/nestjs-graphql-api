import { Injectable, Logger } from '@nestjs/common';
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { buildSchema } from 'type-graphql';
import { MyContext } from './types';
import { redis } from './main';
import { PostResolver } from './resolvers/post.resolver';
import { UserResolver } from './resolvers/user.resolver';

@Injectable()
export class GraphqlConfigService implements GqlOptionsFactory {
  async createGqlOptions(): Promise<GqlModuleOptions> {
    const schema = await buildSchema({
      resolvers: [PostResolver, UserResolver],
    });

    return {
      debug: true,
      playground: true,
      schema,
      context: ({ req, res }): MyContext => ({ req, res, redis }),
      cors: {
        credentials: true,
        origin: 'http://localhost:3000',
      },
    };
  }
}
