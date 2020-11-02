import { MyContext } from '../types';
import { User } from '../entity/user.entity';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import argon2 = require('argon2');
import { sendEmail } from '../utils/sendmail';
import { v4 } from 'uuid';
import { isAuth } from '../middleware/isAuth';
import { Post } from 'src/entity/post.entity';

@InputType()
class UsernamePasswordInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class Error {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @Query(() => String)
  async user() {
    return 'hello from user';
  }

  @FieldResolver(() => String, { nullable: true })
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id.toString()) {
      return user.email;
    }
    return '';
  }

  @Query(() => [User])
  public async getUsers(): Promise<User[]> {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() { req }: MyContext) {
    const user = await User.findOne(req.session.userId);

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    if (!options.email.includes('@')) {
      return {
        errors: [
          {
            field: 'email',
            message: 'invalid email',
          },
        ],
      };
    }
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be 2',
          },
        ],
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be 3',
          },
        ],
      };
    }
    const hashPassword = await argon2.hash(options.password);
    let newuser;
    try {
      newuser = await User.create({
        username: options.username,
        password: hashPassword,
        email: options.email,
      }).save();

      req.session.userId = newuser.id;
    } catch (error) {
      console.error(error);
      if (error.code === 11000) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    return { user: newuser };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOremail') usernameOremail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: {
        $or: [{ username: usernameOremail }, { email: usernameOremail }],
      },
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOremail',
            message: 'user does not exists',
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password does not match',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve => {
      req.session.destroy((err: any) => {
        res.clearCookie('qid', { path: '/' });
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async forgetPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext,
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // user not in db
      return true;
    }

    const token = v4();

    await redis.set(
      'forget-password:' + token,
      user.id.toString(),
      'ex',
      1000 * 60 * 60 * 24 * 3,
    ); // 3 days

    sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`,
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('password') password: string,
    @Ctx() { req, redis }: MyContext,
  ): Promise<UserResponse> {
    if (password.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be 3',
          },
        ],
      };
    }

    const key = 'forget-password:' + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expeired',
          },
        ],
      };
    }

    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists',
          },
        ],
      };
    }
    await redis.del(key);

    user.password = await argon2.hash(password);
    await User.update(
      { id: userId },
      { password: await argon2.hash(password) },
    );

    req.session.userId = user.id;
    return { user };
  }
}

// import {
//   Args,
//   Context,
//   Field,
//   InputType,
//   Mutation,
//   ObjectType,
//   Query,
//   Resolver,
// } from '@nestjs/graphql';
// import { UseGuards } from '@nestjs/common';
