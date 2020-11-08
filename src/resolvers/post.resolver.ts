import { ObjectId } from '@mikro-orm/mongodb';
import { Updoot } from '../entity/updoot.entity';
import { User } from '../entity/user.entity';
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
import { EntityManager, MikroORM, wrap } from '@mikro-orm/core';
import { RepoService } from '../repo.service';

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
  constructor(
    private readonly repoService: RepoService,
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  @Query(() => String)
  async helloPost() {
    return 'hello from post';
  }

  @Query(() => [Post])
  public async getPosts(): Promise<Post[]> {
    const post = this.em.getRepository(Post);
    const posts = await this.repoService.postRepo.findAll(['creator']);

    return posts;
  }

  @FieldResolver(() => String)
  textSnippest(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User, { nullable: true })
  async creator(@Root() root: Post): Promise<User | null> {
    const user = this.em.getRepository(User);
    return await user.findOne(root.creatorId);
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => ID) postId: ObjectId,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext,
  ) {
    const isUpdoot = value === 1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await this.repoService.updootRepo.findOne({
      postId,
      userId,
    });
    const post = await this.repoService.postRepo.findOne(postId);

    // the user has voted on the post before
    // and they are changing their vote
    if (updoot && post) {
      wrap(updoot).assign({ value: realValue });
      await this.repoService.updootRepo.flush();
      wrap(post).assign({ points: post.points + realValue });
      await this.repoService.postRepo.flush();
      return true;
    } else if (!updoot) {
      const updoot = this.repoService.updootRepo.create({
        userId: new ObjectId(userId),
        postId: new ObjectId(postId),
        value: realValue,
      });
      wrap(post).assign({ points: (post?.points as number) + realValue });
      await this.repoService.updootRepo.persistAndFlush(updoot);
      await this.repoService.postRepo.flush();
      return true;
    }
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
      posts = await this.repoService.postRepo.find(
        { createdAt: { $lt: new Date(parseInt(cursor)) } },
        {
          populate: ['creator'],
          limit: realLimitplusone,
          orderBy: { createdAt: 'DESC' },
        },
      );
    } else {
      posts = await this.repoService.postRepo.find(
        {},
        {
          limit: realLimitplusone,
          orderBy: { createdAt: 'DESC' },
          populate: ['creator'],
        },
      );
    }
    console.log(posts.length, realLimit);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length > realLimit,
      // hasMore: true,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => ID) id: ObjectId): Promise<Post | null> {
    return await this.repoService.postRepo.findOne(id, {
      populate: ['creator'],
    });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext,
  ): Promise<Post | null> {
    const post = this.repoService.postRepo.create({
      ...input,
      creatorId: req.session.userId,
    });
    await this.repoService.postRepo.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => ID) id: ObjectId,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('text', () => String, { nullable: true }) text: string,
    @Ctx() { req }: MyContext,
  ): Promise<Post | null> {
    const post = await this.repoService.postRepo.findOne({
      _id: id,
      creatorId: req.session.userId,
    });
    if (!post) {
      throw new Error('not authorize');
      // return null;
    }
    if (typeof title !== 'undefined') {
      wrap(post).assign({ title, text });
      await this.repoService.postRepo.flush();
    }
    return post;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => ID) id: ObjectId,
    @Ctx() { req }: MyContext,
  ): Promise<Boolean> {
    const post = await this.repoService.postRepo.findOne({
      _id: id,
      creatorId: req.session.userId,
    });
    const updoot = await this.repoService.updootRepo.findOne({
      postId: id,
    });
    if (!post) {
      return false;
    }
    await this.repoService.updootRepo.nativeDelete({ postId: id });
    await this.repoService.postRepo.removeAndFlush(post);
    return true;
  }
}
