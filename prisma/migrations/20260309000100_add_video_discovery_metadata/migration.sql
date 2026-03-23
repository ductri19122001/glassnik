-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_processing_status') THEN
        CREATE TYPE "video_processing_status" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');
    END IF;
END $$;

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "country" VARCHAR(120) NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_tags" (
    "video_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "video_tags_pkey" PRIMARY KEY ("video_id","tag_id")
);

-- AlterTable
ALTER TABLE "video_assets"
ADD COLUMN "category_id" INTEGER,
ADD COLUMN "activity_id" INTEGER,
ADD COLUMN "place_id" INTEGER,
ADD COLUMN "latitude" DECIMAL(9,6),
ADD COLUMN "longitude" DECIMAL(9,6),
ADD COLUMN "location_name" VARCHAR(255),
ADD COLUMN "author_display_name" VARCHAR(150),
ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "shares" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "processing_status" "video_processing_status";

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "activities_name_key" ON "activities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_place_name_city_country" ON "places"("name", "city", "country");

-- CreateIndex
CREATE INDEX "idx_places_city" ON "places"("city");

-- CreateIndex
CREATE INDEX "idx_places_country" ON "places"("country");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "idx_video_tags_tag" ON "video_tags"("tag_id");

-- CreateIndex
CREATE INDEX "idx_video_assets_category_id" ON "video_assets"("category_id");

-- CreateIndex
CREATE INDEX "idx_video_assets_activity_id" ON "video_assets"("activity_id");

-- CreateIndex
CREATE INDEX "idx_video_assets_place_id" ON "video_assets"("place_id");

-- CreateIndex
CREATE INDEX "idx_video_assets_status_created_at" ON "video_assets"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_video_assets_trending" ON "video_assets"("views", "likes", "shares");

-- AddForeignKey
ALTER TABLE "video_assets" ADD CONSTRAINT "fk_video_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "video_assets" ADD CONSTRAINT "fk_video_activity" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "video_assets" ADD CONSTRAINT "fk_video_place" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "fk_video_tag_video" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "fk_video_tag_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
