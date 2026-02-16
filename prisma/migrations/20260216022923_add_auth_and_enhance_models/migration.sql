-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "current_period_end" TIMESTAMP(6),
ADD COLUMN     "processor_customer_id" VARCHAR(255),
ADD COLUMN     "processor_subscription_id" VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN DEFAULT false,
ADD COLUMN     "last_login_at" TIMESTAMP(6),
ADD COLUMN     "password_hash" VARCHAR(255),
ADD COLUMN     "provider" VARCHAR(50) DEFAULT 'local',
ADD COLUMN     "provider_id" VARCHAR(255);

-- AlterTable
ALTER TABLE "video_assets" ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration_seconds" INTEGER,
ADD COLUMN     "gcs_path" VARCHAR(500),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mime_type" VARCHAR(50),
ADD COLUMN     "public_url" TEXT,
ADD COLUMN     "size_bytes" BIGINT,
ADD COLUMN     "title" VARCHAR(255);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "is_revoked" BOOLEAN DEFAULT false,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "fk_refresh_token_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
