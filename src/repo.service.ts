import { Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { Post } from './entity/post.entity';
import { Updoot } from './entity/updoot.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityManager,
  EntityRepository,
  MikroORM,
  Repository,
} from '@mikro-orm/core';

@Injectable()
export class RepoService {
  public constructor(
    @InjectRepository(User) public readonly userRepo: EntityRepository<User>,
    @InjectRepository(Post) public readonly postRepo: EntityRepository<Post>,
    @InjectRepository(Updoot)
    public readonly updootRepo: EntityRepository<Updoot>,
  ) {}
}

// export default RepoService;
