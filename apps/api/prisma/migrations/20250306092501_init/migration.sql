-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('SELLING', 'SOLD');

-- CreateEnum
CREATE TYPE "StatusRule" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ARTIST', 'LISTENER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('MINT', 'TRANSFER', 'SALE');

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "poster" TEXT,
    "releaseDate" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 0,
    "totalViewReplay" BIGINT NOT NULL DEFAULT 0,
    "nftSongAddress" TEXT NOT NULL,
    "nftPrice" BIGINT NOT NULL DEFAULT 0,
    "mintedQuantity" INTEGER NOT NULL,
    "maxSupply" INTEGER NOT NULL,
    "currentSupply" INTEGER NOT NULL DEFAULT 0,
    "statusRule" "StatusRule" NOT NULL DEFAULT 'PUBLIC',
    "marketStatus" "MarketStatus" NOT NULL DEFAULT 'SELLING',
    "artistId" INTEGER NOT NULL,
    "ownerAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "nationality" TEXT,
    "walletAddress" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "claimedRewards" BIGINT NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'LISTENER',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" SERIAL NOT NULL,
    "biography" TEXT,
    "totalEarnings" BIGINT NOT NULL DEFAULT 0,
    "personId" INTEGER NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "songId" INTEGER NOT NULL,
    "fromAddress" TEXT,
    "toAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Royalty" (
    "id" SERIAL NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "totalEarned" BIGINT NOT NULL DEFAULT 0,
    "songId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,

    CONSTRAINT "Royalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "amount" BIGINT NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "songId" INTEGER NOT NULL,
    "listenerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "songId" INTEGER NOT NULL,
    "listenerId" INTEGER NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningHistory" (
    "id" SERIAL NOT NULL,
    "durationListened" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "rewardEarned" BIGINT,
    "songId" INTEGER NOT NULL,
    "listenerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Song_nftSongAddress_key" ON "Song"("nftSongAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Person_walletAddress_key" ON "Person"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_personId_key" ON "Artist"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Favorite_songId_idx" ON "Favorite"("songId");

-- CreateIndex
CREATE INDEX "Favorite_listenerId_idx" ON "Favorite"("listenerId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_songId_listenerId_key" ON "Favorite"("songId", "listenerId");

-- CreateIndex
CREATE INDEX "ListeningHistory_songId_idx" ON "ListeningHistory"("songId");

-- CreateIndex
CREATE INDEX "ListeningHistory_listenerId_idx" ON "ListeningHistory"("listenerId");

-- CreateIndex
CREATE INDEX "ListeningHistory_completed_idx" ON "ListeningHistory"("completed");

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_ownerAddress_fkey" FOREIGN KEY ("ownerAddress") REFERENCES "Person"("walletAddress") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromAddress_fkey" FOREIGN KEY ("fromAddress") REFERENCES "Person"("walletAddress") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toAddress_fkey" FOREIGN KEY ("toAddress") REFERENCES "Person"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Royalty" ADD CONSTRAINT "Royalty_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Royalty" ADD CONSTRAINT "Royalty_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
