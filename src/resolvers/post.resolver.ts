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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async voot(
    @Arg('postId', () => ID) postId: ObjectId,
    @Arg('value', () => Number) value: number,
    @Ctx() { req }: MyContext,
  ) {
    const isUpdoot = value !== -1;
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
      console.log(updoot);
      console.log(post);
      // post.points + 2 * realValue
      wrap(updoot).assign({ value });
      await this.repoService.updootRepo.flush();
      wrap(post).assign({ points: post.points + 2 * realValue });
      await this.repoService.postRepo.flush();
      // post.points = 5;
      // await post.save();
    } else if (!updoot) {
      const updoot = this.repoService.updootRepo.create({
        userId,
        postId,
        value: realValue,
      });
      await this.repoService.updootRepo.persistAndFlush(updoot);
      wrap(post).assign({ points: post!.points + realValue });
      await this.repoService.postRepo.flush();
    }

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
      posts = await this.repoService.postRepo.find(
        { createdAt: { $lt: new Date(parseInt(cursor)) } },
        {
          populate: ['creator'],
          limit: realLimitplusone,
          orderBy: { createdAt: 'DESC' },
        },
      );
      // take: realLimitplusone,
      // order: { createdAt: 'DESC' },
      // where: { createdAt: { $lt: new Date(parseInt(cursor)) } },
      // relations: ['user'],
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

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => ID) id: ObjectId): Promise<Post | null> {
    return await this.repoService.postRepo.findOne(id);
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

  @Mutation(() => Post)
  async updatePost(
    @Arg('id', () => ID) id: ObjectId,
    @Arg('title', () => String, { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await this.repoService.postRepo.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      wrap(post).assign({ title });
      await this.repoService.postRepo.flush();
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => ID) id: ObjectId): Promise<Boolean> {
    await this.repoService.postRepo.nativeDelete({ id });
    return true;
  }
}
