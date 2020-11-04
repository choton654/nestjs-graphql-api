import { PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { Field, ID } from 'type-graphql';
import { ObjectId } from '@mikro-orm/mongodb';

export abstract class BaseEntity {
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
}
