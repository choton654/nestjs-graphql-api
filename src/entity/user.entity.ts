// import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Field, ID, ObjectType } from 'type-graphql';
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   Index,
//   ObjectIdColumn,
//   UpdateDateColumn,
//   ObjectID,
//   BaseEntity,
//   OneToMany,
// } from 'typeorm';
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
} from '@mikro-orm/core';
// import { BaseEntity } from './base.entity';
import { Updoot } from './updoot.entity';
import { ObjectId } from '@mikro-orm/mongodb';

@ObjectType()
@Entity()
export class User extends BaseEntity<User, 'id'> {
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

  @OneToMany(
    () => Post,
    post => post.creator,
  )
  posts: Post[];

  @OneToMany(
    () => Updoot,
    updoot => updoot.user,
  )
  updoots: Updoot[];

  @Property()
  @Field(() => String)
  // @Column()
  // @Index({ unique: true })
  username!: string;

  @Property()
  @Field(() => String)
  // @Column({ nullable: false })
  // @Index({ unique: true })
  email!: string;

  @Property()
  // @Column()
  password!: string;

  // @Field(() => String)
  // @CreateDateColumn()
  // createdAt: Date;

  // @Field(() => String)
  // @UpdateDateColumn()
  // updatedAt: Date;
}
