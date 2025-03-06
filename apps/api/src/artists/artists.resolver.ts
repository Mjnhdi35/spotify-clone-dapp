import { Resolver, Query, Args, Int } from '@nestjs/graphql'
import { ArtistsService } from './artists.service'
import { Artist } from './entities/artist.entity'

@Resolver(() => Artist)
export class ArtistsResolver {
  constructor(private readonly artistsService: ArtistsService) {}

  @Query(() => [Artist], { name: 'artists' })
  findAll() {
    return this.artistsService.findAll()
  }

  @Query(() => Artist, { name: 'artist' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.artistsService.findOne(id)
  }
}
