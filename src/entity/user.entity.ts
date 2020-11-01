import { Field, ID, ObjectType } from '@nestjs/graphql';
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
