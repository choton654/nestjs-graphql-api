// import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Field, ID, ObjectType } from 'type-graphql';
// import {
//   Column,
//   ObjectIdColumn,
//   Entity,
//   ObjectID,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
//   Index,
//   OneToMany,
// } from 'typeorm';
import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  PrimaryKey,
  BaseEntity,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
// import { BaseEntity } from './base.entity';
import { Updoot } from './updoot.entity';
import { User } from './user.entity';
import { ObjectId } from '@mikro-orm/mongodb';
// export class Post {
// @PrimaryKey({ type: String })

@ObjectType()
@Entity()
export class Post extends BaseEntity<Post, 'id'> {
  // @Field(() => ID)
  // @ObjectIdColumn()
  // id!: ObjectID;

  // @Field(() => ID)
  // @PrimaryKey()
  // id!: ObjectId;

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
  @ManyToOne(
    () => User,
    // user => user.posts,
  )
  creator: User;

  @OneToMany(
    () => Updoot,
    updoot => updoot.post,
  )
  updoots: Updoot[];

  @Property()
  @Field()
  // @Column()
  title!: string;

  @Property()
  @Field()
  // @Column()
  text!: string;

  @Property()
  @Field()
  // @Column({ type: 'int' })
  @Index({})
  points: number = 0;

  @Property()
  @Field(() => String)
  // @Column({ nullable: false })
  creatorId!: string;

  // @Property()
  // @Field(() => String)
  // @CreateDateColumn({ type: 'date' })
  // createdAt: Date;

  // @Property()
  // @Field(() => String)
  // @UpdateDateColumn()
  // updatedAt: Date;
}
