-- CreateTable
CREATE TABLE "video_activities" (
    "video_id" INTEGER NOT NULL,
    "activity_id" INTEGER NOT NULL,

    CONSTRAINT "video_activities_pkey" PRIMARY KEY ("video_id","activity_id")
);

-- CreateIndex
CREATE INDEX "idx_video_activities_activity_id" ON "video_activities"("activity_id");

-- AddForeignKey
ALTER TABLE "video_activities" ADD CONSTRAINT "fk_video_activity_video" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "video_activities" ADD CONSTRAINT "fk_video_activity_activity" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Backfill existing activity_id values
INSERT INTO "video_activities" ("video_id", "activity_id")
SELECT "id", "activity_id"
FROM "video_assets"
WHERE "activity_id" IS NOT NULL;

-- Drop old foreign key, index, and column
ALTER TABLE "video_assets" DROP CONSTRAINT "fk_video_activity";
DROP INDEX "idx_video_assets_activity_id";
ALTER TABLE "video_assets" DROP COLUMN "activity_id";
