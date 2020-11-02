// import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  Column,
  ObjectIdColumn,
  Entity,
  ObjectID,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { Updoot } from './updoot.entity';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  id!: ObjectID;

  @Field(() => User, { nullable: true })
  @ManyToOne(
    () => User,
    user => user.posts,
  )
  creator: User;

  @OneToMany(
    () => Updoot,
    updoot => updoot.post,
  )
  updoots: Updoot[];

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int' })
  @Index({})
  points: number = 0;

  @Field(() => String)
  @Column({ nullable: false })
  creatorId!: number;

  @Field(() => String)
  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
