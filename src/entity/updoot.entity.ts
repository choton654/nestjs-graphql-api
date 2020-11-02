import {
  Entity,
  BaseEntity,
  ManyToOne,
  Column,
  ObjectIdColumn,
  ObjectID,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

// m to n
// many to many
// user <-> posts
// user -> join table <- posts
// user -> updoot <- posts

@Entity()
export class Updoot extends BaseEntity {
  @Column({ type: 'int' })
  value: number;

  @ObjectIdColumn()
  userId: ObjectID;

  @ManyToOne(
    () => User,
    user => user.updoots,
  )
  user: User;

  @ObjectIdColumn()
  postId: ObjectID;

  @ManyToOne(
    () => Post,
    post => post.updoots,
    {
      onDelete: 'CASCADE',
    },
  )
  post: Post;
}
