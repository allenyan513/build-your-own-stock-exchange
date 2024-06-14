/*
  Warnings:

  - You are about to drop the column `closeTime` on the `CandleSticks` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `CandleSticks` table. All the data in the column will be lost.
  - You are about to alter the column `volume` on the `CandleSticks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `quantity` on the `Trades` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - A unique constraint covering the columns `[symbol,interval,timestamp]` on the table `CandleSticks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timestamp` to the `CandleSticks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CandleSticks" DROP COLUMN "closeTime",
DROP COLUMN "openTime",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "volume" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Trades" ALTER COLUMN "quantity" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CandleSticks_symbol_interval_timestamp_key" ON "CandleSticks"("symbol", "interval", "timestamp");
