import { Injectable } from '@nestjs/common'

@Injectable()
export class ArtistsService {
  findAll() {
    return `This action returns all artists`
  }

  findOne(id: number) {
    return `This action returns a #${id} artist`
  }
}
