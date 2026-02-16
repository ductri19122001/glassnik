-- CreateEnum
CREATE TYPE "capability_badge_type" AS ENUM ('SYSTEM', 'SUBSCRIPTION', 'APPLICATION');

-- CreateEnum
CREATE TYPE "common_status" AS ENUM ('PENDING', 'ACTIVE', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "capabilities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon_url" TEXT,
    "badge_type" "capability_badge_type" NOT NULL,
    "min_amount" DECIMAL(10,2),
    "min_months" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_applications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "capability_code" VARCHAR(100) NOT NULL,
    "status" "common_status" NOT NULL DEFAULT 'PENDING',
    "reviewer_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(6),

    CONSTRAINT "capability_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_code" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "started_at" TIMESTAMP(6),
    "ended_at" TIMESTAMP(6),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_capabilities" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "capability_id" INTEGER NOT NULL,
    "status" "common_status" NOT NULL,
    "granted_datetimeby" TIMESTAMP(6),
    "granted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6),

    CONSTRAINT "user_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100),
    "display_name" VARCHAR(150),
    "avatar_varcharurl" TEXT,
    "status" VARCHAR(50) DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_assets" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "source" VARCHAR(50),
    "eligible_for_stitch" BOOLEAN DEFAULT false,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capabilities_name_key" ON "capabilities"("name");

-- CreateIndex
CREATE INDEX "idx_capability_applications_user_id" ON "capability_applications"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_capabilities_capability_id" ON "user_capabilities"("capability_id");

-- CreateIndex
CREATE INDEX "idx_user_capabilities_user_id" ON "user_capabilities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_capability" ON "user_capabilities"("user_id", "capability_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_video_assets_owner" ON "video_assets"("owner_id");

-- AddForeignKey
ALTER TABLE "capability_applications" ADD CONSTRAINT "fk_cap_app_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "fk_subscription_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_capabilities" ADD CONSTRAINT "fk_user_cap_capability" FOREIGN KEY ("capability_id") REFERENCES "capabilities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_capabilities" ADD CONSTRAINT "fk_user_cap_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "video_assets" ADD CONSTRAINT "fk_video_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
