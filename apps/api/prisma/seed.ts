import { faker } from '@faker-js/faker'
import {
  MarketStatus,
  PrismaClient,
  StatusRule,
  TransactionType,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // 1. Xóa toàn bộ data cũ theo đúng thứ tự quan hệ
    await prisma.listeningHistory.deleteMany()
    await prisma.favorite.deleteMany()
    await prisma.reward.deleteMany()
    await prisma.royalty.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.song.deleteMany()
    await prisma.artist.deleteMany()
    await prisma.person.deleteMany()

    // 2. Tạo Person (5 ARTIST đầu, 5 LISTENER sau)
    const users = await Promise.all(
      Array.from({ length: 10 }, (_, i) => {
        const role = i < 5 ? 'ARTIST' : 'LISTENER'
        return prisma.person.create({
          data: {
            name: faker.person.fullName(),
            dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
            nationality: faker.location.country(),
            walletAddress: faker.finance.ethereumAddress(),
            balance: BigInt(faker.number.int({ min: 1000, max: 100000 })),
            role,
            avatar: faker.image.avatar(),
          },
        })
      }),
    )

    // 3. Tạo Artist từ 5 user đầu
    const artists = await Promise.all(
      users.slice(0, 5).map((user) =>
        prisma.artist.create({
          data: {
            personId: user.id,
            biography: faker.lorem.paragraph(),
            totalEarnings: BigInt(
              faker.number.int({ min: 10000, max: 1000000 }),
            ),
          },
        }),
      ),
    )

    // 4. Tạo Song với owner ngẫu nhiên
    const songs = await Promise.all(
      Array.from({ length: 20 }, (_, i) => {
        const artist = artists[i % 5]
        const owner = users[faker.number.int({ min: 0, max: 9 })]

        return prisma.song.create({
          data: {
            name: faker.music.songName(),
            description: faker.lorem.sentence(),
            poster: faker.image.url(),
            releaseDate: faker.date.past({ years: 2 }),
            duration: faker.number.int({ min: 120, max: 300 }),
            totalViewReplay: BigInt(
              faker.number.int({ min: 1000, max: 100000 }),
            ),
            nftSongAddress: faker.finance.ethereumAddress(),
            nftPrice: BigInt(faker.number.int({ min: 1, max: 100 })),
            mintedQuantity: faker.number.int({ min: 100, max: 1000 }),
            maxSupply: faker.number.int({ min: 1000, max: 5000 }),
            currentSupply: faker.number.int({ min: 0, max: 100 }),
            statusRule: faker.helpers.arrayElement([
              StatusRule.PUBLIC,
              StatusRule.PRIVATE,
            ]),
            marketStatus: faker.helpers.arrayElement([
              MarketStatus.SELLING,
              MarketStatus.SOLD,
            ]),
            artistId: artist.id,
            ownerAddress: owner.walletAddress,
          },
        })
      }),
    )

    // 5. Tạo Transaction
    const transactions = await Promise.all(
      Array.from({ length: 30 }, (_, i) => {
        const fromUser = users[faker.number.int({ min: 0, max: 4 })] // Artist
        const toUser = users[faker.number.int({ min: 5, max: 9 })] // Listener

        return prisma.transaction.create({
          data: {
            txHash: faker.string.uuid(),
            price: BigInt(faker.number.int({ min: 1, max: 100 })),
            type: TransactionType.SALE,
            songId: songs[i % 20].id,
            fromAddress: fromUser.walletAddress,
            toAddress: toUser.walletAddress,
          },
        })
      }),
    )

    // 6. Tạo Royalty
    await Promise.all(
      songs.map((song) =>
        prisma.royalty.create({
          data: {
            percentage: faker.number.float({
              min: 0.01,
              max: 0.1,
              fractionDigits: 2,
            }),
            totalEarned: BigInt(faker.number.int({ min: 100, max: 10000 })),
            songId: song.id,
            artistId: song.artistId,
          },
        }),
      ),
    )

    // 7. Tạo Reward với unique check
    const rewards = []
    const rewardKeys = new Set<string>()

    while (rewards.length < 50) {
      const song = faker.helpers.arrayElement(songs)
      const listener = faker.helpers.arrayElement(users.slice(5))
      const key = `${song.id}-${listener.id}`

      if (!rewardKeys.has(key)) {
        rewards.push(
          prisma.reward.create({
            data: {
              amount: BigInt(faker.number.int({ min: 1, max: 100 })),
              isClaimed: faker.datatype.boolean(),
              songId: song.id,
              listenerId: listener.id,
            },
          }),
        )
        rewardKeys.add(key)
      }
    }
    await Promise.all(rewards)

    // 8. Tạo Favorite với unique check
    const favorites = []
    const favoriteKeys = new Set<string>()

    while (favorites.length < 30) {
      const song = faker.helpers.arrayElement(songs)
      const listener = faker.helpers.arrayElement(users.slice(5))
      const key = `${song.id}-${listener.id}`

      if (!favoriteKeys.has(key)) {
        favorites.push(
          prisma.favorite.create({
            data: {
              songId: song.id,
              listenerId: listener.id,
            },
          }),
        )
        favoriteKeys.add(key)
      }
    }
    await Promise.all(favorites)

    // 9. Tạo ListeningHistory
    const histories = Array.from({ length: 100 }, () => {
      const song = faker.helpers.arrayElement(songs)
      const listener = faker.helpers.arrayElement(users.slice(5))

      return prisma.listeningHistory.create({
        data: {
          durationListened: faker.number.int({ min: 10, max: song.duration }),
          completed: faker.datatype.boolean(),
          rewardEarned: BigInt(faker.number.int({ min: 1, max: 10 })),
          songId: song.id,
          listenerId: listener.id,
        },
      })
    })
    await Promise.all(histories)

    console.log('✅ Seed data created successfully!')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
