import { Updoot } from './entity/updoot.entity';
import { User } from './entity/user.entity';
import { Post } from './entity/post.entity';
import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { BaseEntity } from './entity/base.entity';

const logger = new Logger('MikroORM');
const config = {
  entities: [Post, User, Updoot],
  dbName: 'lireddit',
  type: 'mongo',
  debug: true,
  logger: logger.log.bind(logger),
  highlighter: new MongoHighlighter(),
} as Options;

export default config;
