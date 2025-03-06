import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateArtistInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
