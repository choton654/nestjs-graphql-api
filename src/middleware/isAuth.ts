import { MyContext } from '../types';
import { MiddlewareFn } from 'type-graphql';

export const isAuth: MiddlewareFn<MyContext> = (
  { context },
  next,
): Promise<any> => {
  if (!context.req.session.userId) {
    throw new Error('not authenticated');
    // return null;
  }
  return next();
};

// import { User } from '../entity/user.entity';
// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { GqlExecutionContext } from '@nestjs/graphql';
// import { ApolloError } from 'apollo-server-express';
// @Injectable()
// export class AuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean | null {
//     const ctx = GqlExecutionContext.create(context).getContext();
//     if (!ctx.req.session.userId) {
//       throw new ApolloError('not authenticated');
//       // return null;
//     }
//     return true;
//   }
// }
