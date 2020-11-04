// import {
//   Entity,
//   BaseEntity,
//   ManyToOne,
//   Column,
//   ObjectIdColumn,
//   ObjectID,
// } from 'typeorm';
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

  // @Property()
  // createdAt = new Date();

  // @Property({ onUpdate: () => new Date() })
  // updatedAt = new Date();

  @Property()
  // @Column({ type: 'int' })
  value: number;

  @Property()
  // @ObjectIdColumn()
  userId: ObjectId;

  @ManyToOne(
    () => User,
    // user => user.updoots,
  )
  user: User;

  @Property()
  // @ObjectIdColumn()
  postId: ObjectId;

  @ManyToOne(
    () => Post,
    // post => post.updoots,
  )
  // @ManyToOne(
  //   () => Post,
  //   post => post.updoots,
  //   {
  //     onDelete: 'CASCADE',
  //   },
  // )
  post: Post;
}
