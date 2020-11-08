import { Field, ID, Int, ObjectType } from 'type-graphql';
import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  PrimaryKey,
  BaseEntity,
  SerializedPrimaryKey,
  Collection,
  Cascade,
} from '@mikro-orm/core';
// import { BaseEntity } from './base.entity';
import { Updoot } from './updoot.entity';
import { User } from './user.entity';
import { ObjectId } from '@mikro-orm/mongodb';

@ObjectType()
@Entity()
export class Post extends BaseEntity<Post, 'id'> {
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

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  creator: User;

  @OneToMany(
    () => Updoot,
    updoot => updoot.post,
  )
  updoots = new Collection<Updoot>(this);
  // { cascade: [Cascade.ALL] },

  @Property()
  @Field(() => String)
  title!: string;

  @Property()
  @Field()
  text!: string;

  @Property()
  @Field()
  @Index({})
  points: number = 0;

  @Property()
  @Field()
  creatorId!: string;

  @Field(() => Int, { nullable: true })
  voteStatus!: number | null;
}
