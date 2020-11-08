import { User } from './user.entity';
import { Post } from './post.entity';
import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  PrimaryKey,
  BaseEntity,
  Cascade,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
// import { BaseEntity } from './base.entity';

// m to n
// many to many
// user <-> posts
// user -> join table <- posts
// user -> updoot <- posts

@Entity()
export class Updoot extends BaseEntity<Updoot, 'id'> {
  @PrimaryKey()
  id!: ObjectId;

  @Property()
  value: number;

  @Property()
  userId: ObjectId;

  @ManyToOne(() => User)
  user: User;

  @Property()
  postId: ObjectId;

  @ManyToOne(() => Post, { cascade: [Cascade.PERSIST, Cascade.REMOVE] })
  post: Post;
}
