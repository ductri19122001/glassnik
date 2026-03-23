-- CreateTable
CREATE TABLE "video_categories" (
    "video_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "video_categories_pkey" PRIMARY KEY ("video_id","category_id")
);

-- CreateIndex
CREATE INDEX "idx_video_categories_category_id" ON "video_categories"("category_id");

-- AddForeignKey
ALTER TABLE "video_categories" ADD CONSTRAINT "fk_video_category_video" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "video_categories" ADD CONSTRAINT "fk_video_category_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Backfill existing category_id values
INSERT INTO "video_categories" ("video_id", "category_id")
SELECT "id", "category_id"
FROM "video_assets"
WHERE "category_id" IS NOT NULL;

-- Drop old foreign key, index, and column
ALTER TABLE "video_assets" DROP CONSTRAINT "fk_video_category";
DROP INDEX "idx_video_assets_category_id";
ALTER TABLE "video_assets" DROP COLUMN "category_id";
