import { User } from './../entity/user.entity';
import { MyContext } from '../types';

import {
  Query,
  Resolver,
  Arg,
  ID,
  Mutation,
  Field,
  InputType,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from 'type-graphql';
import { Post } from '../entity/post.entity';
import { isAuth } from '../middleware/isAuth';
import { ObjectID } from 'typeorm';

@InputType()
class PostInput {
  @Field()
  text: string;
  @Field()
  title: string;
}

@ObjectType()
class PginatePosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: Boolean;
}

@Resolver(Post)
export class PostResolver {
  @Query(() => String)
  async helloPost() {
    return 'hello from post';
  }

  @Query(() => [Post])
  public async getPosts(): Promise<Post[]> {
    return Post.find();
  }

  @FieldResolver(() => String)
  textSnippest(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User, { nullable: true })
  async creator(@Root() root: Post): Promise<User> {
    const user = await User.findOne(root.creatorId);
    return user;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async voot(
    @Arg('postId', () => Number) postid: number,
    @Arg('value', () => Number) value: number,
    @Ctx() { req }: MyContext,
  ) {
    return true;
  }

  @Query(() => PginatePosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PginatePosts> {
    const realLimit = Math.min(50, limit);
    const realLimitplusone = realLimit + 1;
    let posts;

    if (cursor) {
      posts = await Post.find({
        take: realLimitplusone,
        order: { createdAt: 'DESC' },
        where: { createdAt: { $lt: new Date(parseInt(cursor)) } },
        relations: ['user'],
      });
    } else {
      posts = await Post.find({
        take: realLimitplusone,
        order: { createdAt: 'DESC' },
        relations: ['user'],
      });
    }

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => ID) id: ObjectID): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext,
  ): Promise<Post | null> {
    const post = await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('id', () => ID) id: ObjectID,
    @Arg('title', () => String, { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;

      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => ID) id: ObjectID): Promise<Boolean> {
    await Post.delete({ id });
    return true;
  }
}

// import { UseGuards } from '@nestjs/common';
// import {
//   Args,
//   Context,
//   ResolveField,
//   Field,
//   InputType,
//   Mutation,
//   ObjectType,
//   Root,
//   Int,
//   ID,
// } from '@nestjs/graphql';

// @Query(() => PginatePosts)
// async posts(
//   @Args('limit', { type: () => Int }) limit: number,
//   @Args('cursor', { type: () => String, nullable: true })
//   cursor: string | null,
// ): Promise<PginatePosts> {
//   const realLimit = Math.min(50, limit);
//   const realLimitplusone = realLimit + 1;
//   let posts;

//   if (cursor) {
//     posts = await Post.find({
//       take: realLimitplusone,
//       order: { createdAt: 'DESC' },
//       where: { createdAt: { $lt: new Date(parseInt(cursor)) } },
//     });
//   } else {
//     posts = await Post.find({
//       take: realLimitplusone,
//       order: { createdAt: 'DESC' },
//     });
//   }

//   return {
//     posts: posts.slice(0, realLimit),
//     hasMore: posts.length === realLimitplusone,
//     // hasMore: true,
//   };
// }

// @Query(() => Post, { nullable: true })
// public async getPost(
//   @Args('id', { type: () => ID }) id: ObjectID,
// ): Promise<Post | undefined> {
//   return Post.findOne(id);
// }

// @Mutation(() => Post)
// @UseGuards(new AuthGuard())
// async createPost(
//   @Args('input') input: PostInput,
//   @Context() { req }: MyContext,
// ): Promise<Post | null> {
//   const post = await Post.create({
//     ...input,
//     creatorId: req.session.userId,
//   }).save();
//   return post;
// }

// @Mutation(() => Post)
// async updatePost(
//   @Args('id', { type: () => ID }) id: ObjectID,
//   @Args('title', { type: () => String, nullable: true }) title: string,
// ): Promise<Post | null> {
//   const post = await Post.findOne(id);
//   if (!post) {
//     return null;
//   }
//   if (typeof title !== 'undefined') {
//     post.title = title;

//     await Post.update({ id }, { title });
//   }
//   return post;
// }

// @Mutation(() => Boolean)
// async deletePost(
//   @Args('id', { type: () => ID }) id: ObjectID,
// ): Promise<Boolean> {
//   await Post.delete({ id });
//   return true;
// }
