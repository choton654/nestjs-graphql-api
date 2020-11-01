import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import RepoService from './repo.service';
import { User } from './entity/user.entity';
import { Post } from './entity/post.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Post])],
  providers: [RepoService],
  exports: [RepoService],
})
class RepoModule {}
export default RepoModule;
