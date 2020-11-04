import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RepoService } from './repo.service';
import { User } from './entity/user.entity';
import { Post } from './entity/post.entity';
import { Updoot } from './entity/updoot.entity';
import { PostResolver } from './resolvers/post.resolver';
import { UserResolver } from './resolvers/user.resolver';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([User, Post, Updoot])],
  providers: [RepoService, PostResolver, UserResolver],
  exports: [RepoService],
})
class RepoModule {}
export default RepoModule;
