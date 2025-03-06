import { Test, TestingModule } from '@nestjs/testing'
import { ArtistsResolver } from './artists.resolver'
import { ArtistsService } from './artists.service'

describe('ArtistsResolver', () => {
  let resolver: ArtistsResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtistsResolver, ArtistsService],
    }).compile()

    resolver = module.get<ArtistsResolver>(ArtistsResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
