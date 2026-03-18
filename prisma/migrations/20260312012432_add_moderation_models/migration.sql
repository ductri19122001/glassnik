-- CreateEnum
CREATE TYPE "moderation_status" AS ENUM ('SUBMITTED', 'AUTO_SCREENED', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'TAKEDOWN');

-- CreateEnum
CREATE TYPE "report_reason" AS ENUM ('SPAM', 'NUDITY', 'VIOLENCE', 'HATE', 'HARASSMENT', 'COPYRIGHT', 'SELF_HARM', 'OTHER');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "moderation_severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "flag_status" AS ENUM ('OPEN', 'ACKED', 'CLEARED');

-- CreateEnum
CREATE TYPE "moderation_action_type" AS ENUM ('APPROVE', 'REJECT', 'REMOVE', 'SHADOW_BAN', 'AGE_RESTRICT');

-- CreateEnum
CREATE TYPE "moderation_queue_status" AS ENUM ('PENDING', 'ASSIGNED', 'DONE', 'SKIPPED');

-- AlterTable
ALTER TABLE "video_assets" ADD COLUMN     "moderation_reviewed_at" TIMESTAMP(6),
ADD COLUMN     "moderation_score" DECIMAL(5,2),
ADD COLUMN     "moderation_status" "moderation_status" DEFAULT 'SUBMITTED';

-- CreateTable
CREATE TABLE "moderation_reports" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "reporter_id" INTEGER,
    "reason" "report_reason" NOT NULL,
    "details" TEXT,
    "status" "report_status" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(6),

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_flags" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "source" VARCHAR(120) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "confidence" DECIMAL(5,2),
    "severity" "moderation_severity" NOT NULL DEFAULT 'MEDIUM',
    "status" "flag_status" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "moderator_id" INTEGER,
    "action" "moderation_action_type" NOT NULL,
    "reason" TEXT,
    "policy_version" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_queue_items" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "status" "moderation_queue_status" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assigned_to_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assigned_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),

    CONSTRAINT "moderation_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_moderation_reports_video_id" ON "moderation_reports"("video_id");

-- CreateIndex
CREATE INDEX "idx_moderation_reports_reporter_id" ON "moderation_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "idx_moderation_reports_status_created_at" ON "moderation_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_moderation_flags_video_id" ON "moderation_flags"("video_id");

-- CreateIndex
CREATE INDEX "idx_moderation_flags_status_created_at" ON "moderation_flags"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_moderation_flags_severity" ON "moderation_flags"("severity");

-- CreateIndex
CREATE INDEX "idx_moderation_actions_video_id" ON "moderation_actions"("video_id");

-- CreateIndex
CREATE INDEX "idx_moderation_actions_moderator_id" ON "moderation_actions"("moderator_id");

-- CreateIndex
CREATE INDEX "idx_moderation_actions_action_created_at" ON "moderation_actions"("action", "created_at");

-- CreateIndex
CREATE INDEX "idx_moderation_queue_video_id" ON "moderation_queue_items"("video_id");

-- CreateIndex
CREATE INDEX "idx_moderation_queue_assignee_id" ON "moderation_queue_items"("assigned_to_id");

-- CreateIndex
CREATE INDEX "idx_moderation_queue_status_priority_created_at" ON "moderation_queue_items"("status", "priority", "created_at");

-- CreateIndex
CREATE INDEX "idx_video_assets_moderation_status_created_at" ON "video_assets"("moderation_status", "created_at");

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "fk_moderation_report_video" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "fk_moderation_report_user" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moderation_flags" ADD CONSTRAINT "fk_moderation_flag_video" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "fk_moderation_action_video" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "fk_moderation_action_user" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moderation_queue_items" ADD CONSTRAINT "fk_moderation_queue_video" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moderation_queue_items" ADD CONSTRAINT "fk_moderation_queue_user" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
