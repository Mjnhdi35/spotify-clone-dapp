import { faker } from '@faker-js/faker'
import {
  PrismaClient,
  MarketStatus,
  NFTStatus,
  TransactionStatus,
  RoyaltyStatus,
} from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.reward.deleteMany()
  await prisma.artistRoyalty.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.playHistory.deleteMany()
  await prisma.songNFT.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.seller.deleteMany()
  await prisma.buyer.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          id: faker.string.uuid(),
          walletAddress: faker.finance.ethereumAddress(),
          email: faker.internet.email(),
        },
      }),
    ),
  )

  // Create Buyers and Sellers
  const buyers = await Promise.all(
    users.map((user) =>
      prisma.buyer.create({
        data: {
          balance: new Decimal(faker.finance.amount({ min: 100, max: 1000 })),
          rewards: new Decimal(faker.finance.amount({ min: 0, max: 100 })),
          user: {
            connectOrCreate: {
              where: { id: user.id },
              create: {
                id: user.id,
                walletAddress: user.walletAddress,
                email: user.email,
              },
            },
          },
        },
      }),
    ),
  )

  const sellers = await Promise.all(
    users.slice(0, 5).map((user) =>
      prisma.seller.create({
        data: {
          balance: new Decimal(faker.finance.amount({ min: 1000, max: 5000 })),
          totalSales: new Decimal(0),
          user: {
            connectOrCreate: {
              where: { id: user.id },
              create: {
                id: user.id,
                walletAddress: user.walletAddress,
                email: user.email,
              },
            },
          },
        },
      }),
    ),
  )

  // Create Artists
  const artists = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sellers.map((seller) =>
      prisma.artist.create({
        data: {
          name: faker.person.fullName(),
          bio: faker.lorem.paragraph(),
          walletAddress: faker.finance.ethereumAddress(),
        },
      }),
    ),
  )

  // Create SongNFTs
  const songNFTs = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.songNFT.create({
        data: {
          id: faker.string.uuid(),
          title: faker.music.songName(),
          duration: faker.number.int({ min: 120, max: 300 }),
          poster: faker.image.url(),
          marketStatus: faker.helpers.arrayElement([
            MarketStatus.SELLING,
            MarketStatus.SOLD,
          ]),
          status: faker.helpers.arrayElement([
            NFTStatus.PUBLIC,
            NFTStatus.PRIVATE,
          ]),
          royaltyPercentage: new Decimal(
            faker.number.float({ min: 0.05, max: 0.2 }),
          ),
          price: new Decimal(faker.finance.amount({ min: 1, max: 10 })),
          releaseDate: faker.date.past(),
          nftAddress: faker.finance.ethereumAddress(),
          musicUrl: faker.internet.url(),
          artistId: artists[i % 5].id,
          sellerId: sellers[i % 5].id,
        },
      }),
    ),
  )

  // Create Transactions and ArtistRoyalties
  for (const songNFT of songNFTs) {
    const buyer = faker.helpers.arrayElement(buyers)
    const transaction = await prisma.transaction.create({
      data: {
        txHash: faker.string.uuid(),
        amount: songNFT.price,
        status: faker.helpers.arrayElement([
          TransactionStatus.PENDING,
          TransactionStatus.COMPLETED,
          TransactionStatus.FAILED,
        ]),
        nftId: songNFT.id,
        buyerId: buyer.id,
        sellerId: songNFT.sellerId,
      },
    })

    await prisma.artistRoyalty.create({
      data: {
        amount: songNFT.price.times(songNFT.royaltyPercentage),
        status: faker.helpers.arrayElement([
          RoyaltyStatus.PENDING,
          RoyaltyStatus.PAID,
          RoyaltyStatus.FAILED,
        ]),
        artistId: songNFT.artistId,
        transactionId: transaction.id,
        nftId: songNFT.id,
      },
    })

    await prisma.seller.update({
      where: { id: songNFT.sellerId },
      data: {
        totalSales: { increment: songNFT.price },
        balance: { increment: songNFT.price },
      },
    })

    await prisma.artist.update({
      where: { id: songNFT.artistId },
      data: {
        totalEarnings: {
          increment: songNFT.price.times(songNFT.royaltyPercentage),
        },
      },
    })
  }

  // Create PlayHistories and Rewards
  for (let i = 0; i < 100; i++) {
    const buyer = faker.helpers.arrayElement(buyers)
    const songNFT = faker.helpers.arrayElement(songNFTs)
    const durationPlayed = faker.number.int({
      min: 30,
      max: songNFT.duration + 60,
    })

    await prisma.playHistory.create({
      data: {
        durationPlayed,
        buyerId: buyer.id,
        nftId: songNFT.id,
      },
    })

    if (durationPlayed >= songNFT.duration) {
      await prisma.reward.create({
        data: {
          amount: new Decimal(faker.finance.amount({ min: 1, max: 10 })),
          buyerId: buyer.id,
          nftId: songNFT.id,
        },
      })
    }
  }

  console.log('✅ Seed data thành công!')
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
