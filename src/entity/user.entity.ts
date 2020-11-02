// import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
  UpdateDateColumn,
  ObjectID,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Post } from './post.entity';
import { Updoot } from './updoot.entity';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  id!: ObjectID;

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

  @Field(() => String)
  @Column()
  @Index({ unique: true })
  username!: string;

  @Field(() => String)
  @Column({ nullable: false })
  @Index({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
