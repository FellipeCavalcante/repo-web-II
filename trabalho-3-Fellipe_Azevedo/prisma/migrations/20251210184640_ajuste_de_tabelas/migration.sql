/*
  Warnings:

  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `poll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `poll_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `poll_option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "poll" DROP CONSTRAINT "poll_createdById_fkey";

-- DropForeignKey
ALTER TABLE "poll_category" DROP CONSTRAINT "poll_category_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "poll_category" DROP CONSTRAINT "poll_category_pollId_fkey";

-- DropForeignKey
ALTER TABLE "poll_option" DROP CONSTRAINT "poll_option_pollId_fkey";

-- DropTable
DROP TABLE "category";

-- DropTable
DROP TABLE "poll";

-- DropTable
DROP TABLE "poll_category";

-- DropTable
DROP TABLE "poll_option";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_data" BYTEA,
    "image_type" VARCHAR(50),
    "visibility" "PollVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "PollStatus" NOT NULL DEFAULT 'OPEN',
    "start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMP(3),
    "expected_votes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" UUID NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "text" VARCHAR(255) NOT NULL,
    "image_data" BYTEA,
    "image_type" VARCHAR(50),
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poll_id" UUID NOT NULL,

    CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_categories" (
    "poll_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "poll_categories_pkey" PRIMARY KEY ("poll_id","category_id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "voted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "poll_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "polls_creator_id_idx" ON "polls"("creator_id");

-- CreateIndex
CREATE INDEX "polls_status_idx" ON "polls"("status");

-- CreateIndex
CREATE INDEX "polls_visibility_idx" ON "polls"("visibility");

-- CreateIndex
CREATE INDEX "polls_start_at_idx" ON "polls"("start_at");

-- CreateIndex
CREATE INDEX "polls_end_at_idx" ON "polls"("end_at");

-- CreateIndex
CREATE INDEX "poll_options_poll_id_idx" ON "poll_options"("poll_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "poll_categories_poll_id_idx" ON "poll_categories"("poll_id");

-- CreateIndex
CREATE INDEX "poll_categories_category_id_idx" ON "poll_categories"("category_id");

-- CreateIndex
CREATE INDEX "votes_poll_id_idx" ON "votes"("poll_id");

-- CreateIndex
CREATE INDEX "votes_option_id_idx" ON "votes"("option_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_poll_id_key" ON "votes"("user_id", "poll_id");

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_categories" ADD CONSTRAINT "poll_categories_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_categories" ADD CONSTRAINT "poll_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
