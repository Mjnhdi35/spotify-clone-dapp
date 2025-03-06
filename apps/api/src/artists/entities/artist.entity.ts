import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export class Artist {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field({ nullable: true })
  dob?: Date

  @Field({ nullable: true })
  nationality?: string

  @Field()
  address: string

  @Field({ nullable: true })
  balance: number

  @Field({ nullable: true })
  createdAt: Date

  @Field({ nullable: true })
  updatedAt: Date
}
