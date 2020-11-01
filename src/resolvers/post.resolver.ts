import { UseGuards } from '@nestjs/common';
import { MyContext } from '../types';
import {
  Args,
  Context,
  ResolveField,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  Int,
  ID,
} from '@nestjs/graphql';
import { Post } from '../entity/post.entity';
import { AuthGuard } from '../middleware/auth.guard';
import { Arg } from 'type-graphql';
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

@Resolver(() => Post)
export class PostResolver {
  @Query(() => String)
  async helloPost() {
    return 'hello from post';
  }

  @Query(() => [Post])
  public async getPosts(): Promise<Post[]> {
    return Post.find();
  }

  @ResolveField(() => String)
  textSnippest(@Root() root: Post) {
    return root.text.slice(0, 50);
  }
  @Query(() => PginatePosts)
  async posts(
    @Args('limit', { type: () => Int }) limit: number,
    @Args('cursor', { type: () => String, nullable: true })
    cursor: string | null,
  ): Promise<PginatePosts> {
    const realLimit = Math.min(50, limit);
    const realLimitplusone = realLimit + 1;
    let posts;

    if (cursor) {
      posts = await Post.find({
        take: realLimitplusone,
        order: { createdAt: 'DESC' },
        where: { createdAt: { $lt: new Date(parseInt(cursor)) } },
      });
    } else {
      posts = await Post.find({
        take: realLimitplusone,
        order: { createdAt: 'DESC' },
      });
    }

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  public async getPost(
    @Args('id', { type: () => ID }) id: ObjectID,
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseGuards(new AuthGuard())
  async createPost(
    @Args('input') input: PostInput,
    @Context() { req }: MyContext,
  ): Promise<Post | null> {
    const post = await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => ID }) id: ObjectID,
    @Args('title', { type: () => String, nullable: true }) title: string,
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
  async deletePost(
    @Args('id', { type: () => ID }) id: ObjectID,
  ): Promise<Boolean> {
    await Post.delete({ id });
    return true;
  }
}
