import { Field, ID, ObjectType } from 'type-graphql';
import { Post } from './post.entity';
import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  PrimaryKey,
  BaseEntity,
  SerializedPrimaryKey,
  Unique,
  Collection,
} from '@mikro-orm/core';
// import { BaseEntity } from './base.entity';
import { Updoot } from './updoot.entity';
import { ObjectId } from '@mikro-orm/mongodb';

@ObjectType()
@Entity()
export class User extends BaseEntity<User, 'id'> {
  @Field(() => ID)
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Field(() => String)
  @Property()
  createdAt = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @OneToMany(
    () => Post,
    post => post.creator,
  )
  posts = new Collection<Post>(this);

  @OneToMany(
    () => Updoot,
    updoot => updoot.user,
  )
  updoots = new Collection<Updoot>(this);

  @Property()
  @Unique()
  @Field(() => String)
  username!: string;

  @Property()
  @Field(() => String)
  @Unique()
  // @Index()
  email!: string;

  @Property()
  password!: string;
}
