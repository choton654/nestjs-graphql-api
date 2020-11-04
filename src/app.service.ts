import { Post } from './entity/post.entity';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RepoService } from './repo.service';

@Injectable()
export class AppService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
    private readonly repoService: RepoService,
  ) {}
  async getHello(): Promise<string> {
    const post = this.orm.em.getRepository(Post);
    console.log(await this.repoService.postRepo.findAll());

    console.log(await post.findAll());
    return 'Helo World!';
  }
}
