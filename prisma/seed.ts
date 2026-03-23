import {
  PrismaClient,
  ModerationStatus,
  ReportReason,
  ReportStatus,
  ModerationSeverity,
  FlagStatus,
  ModerationActionType,
  QueueStatus,
} from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for seeding.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: 'Street Scenes', slug: 'street-scenes' },
  { name: 'Markets', slug: 'markets' },
  { name: 'Beaches', slug: 'beaches' },
  { name: 'Museums', slug: 'museums' },
  { name: 'Heritage Buildings', slug: 'heritage-buildings' },
  { name: 'Shopping', slug: 'shopping' },
  { name: 'Events', slug: 'events' },
];

const activities = [
  { name: 'Walking' },
  { name: 'Shopping' },
  { name: 'Eating' },
  { name: 'Street Food' },
  { name: 'Sightseeing' },
  { name: 'Festival' },
];

const places = [
  {
    name: 'Chatuchak Market',
    city: 'Bangkok',
    country: 'Thailand',
    latitude: 13.7995,
    longitude: 100.5501,
  },
  {
    name: 'Ben Thanh Market',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    latitude: 10.7725,
    longitude: 106.698,
  },
  {
    name: 'Bondi Beach',
    city: 'Sydney',
    country: 'Australia',
    latitude: -33.8908,
    longitude: 151.2743,
  },
  {
    name: 'Old Quarter',
    city: 'Hanoi',
    country: 'Vietnam',
    latitude: 21.0338,
    longitude: 105.8522,
  },
  {
    name: 'Asakusa',
    city: 'Tokyo',
    country: 'Japan',
    latitude: 35.7148,
    longitude: 139.7967,
  },
];

const seedUsers = [
  {
    email: 'creator@example.com',
    username: 'creator',
    displayName: 'Creator One',
    status: 'ACTIVE',
  },
  {
    email: 'reporter@example.com',
    username: 'reporter',
    displayName: 'Reporter One',
    status: 'ACTIVE',
  },
  {
    email: 'moderator@example.com',
    username: 'moderator',
    displayName: 'Moderator One',
    status: 'ACTIVE',
  },
];

async function main() {
  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  await prisma.activity.createMany({
    data: activities,
    skipDuplicates: true,
  });

  await prisma.place.createMany({
    data: places,
    skipDuplicates: true,
  });

  const users = await Promise.all(
    seedUsers.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      }),
    ),
  );

  const creator = users.find((user) => user.email === 'creator@example.com');
  const reporter = users.find((user) => user.email === 'reporter@example.com');
  const moderator = users.find((user) => user.email === 'moderator@example.com');

  if (!creator || !reporter || !moderator) {
    throw new Error('[seed] expected seed users to be created');
  }

  const firstCategory = await prisma.category.findFirst();
  const firstActivity = await prisma.activity.findFirst();
  const firstPlace = await prisma.place.findFirst();

  let video = await prisma.videoAsset.findFirst({
    where: {
      ownerId: creator.id,
      title: 'Bangkok Night Market Walk',
    },
  });

  if (!video) {
    video = await prisma.videoAsset.create({
      data: {
        ownerId: creator.id,
        title: 'Bangkok Night Market Walk',
        description: 'Sample video for moderation workflow.',
        source: 'seed',
        publicUrl: 'https://example.com/videos/sample.mp4',
        mimeType: 'video/mp4',
        sizeBytes: BigInt(125_000_000),
        durationSeconds: 120,
        placeId: firstPlace?.id ?? null,
        latitude: 13.7563,
        longitude: 100.5018,
        locationName: 'Bangkok',
        authorDisplayName: 'Creator One',
        status: 'ACTIVE',
        processingStatus: 'READY',
        moderationStatus: ModerationStatus.NEEDS_REVIEW,
        moderationScore: 72.5,
        categories: firstCategory?.id
          ? {
              create: [
                {
                  category: { connect: { id: firstCategory.id } },
                },
              ],
            }
          : undefined,
        activities: firstActivity?.id
          ? {
              create: [
                {
                  activity: { connect: { id: firstActivity.id } },
                },
              ],
            }
          : undefined,
      },
    });
  }

  const existingReports = await prisma.moderationReport.count({
    where: { videoId: video.id },
  });

  if (existingReports === 0) {
    await prisma.moderationReport.createMany({
      data: [
        {
          videoId: video.id,
          reporterId: reporter.id,
          reason: ReportReason.NUDITY,
          details: 'Possible nudity in the first 10 seconds.',
          status: ReportStatus.OPEN,
        },
        {
          videoId: video.id,
          reporterId: reporter.id,
          reason: ReportReason.SPAM,
          details: 'Looks like repeated content.',
          status: ReportStatus.IN_REVIEW,
        },
      ],
    });
  }

  const existingFlags = await prisma.moderationFlag.count({
    where: { videoId: video.id },
  });

  if (existingFlags === 0) {
    await prisma.moderationFlag.createMany({
      data: [
        {
          videoId: video.id,
          source: 'automod-v1',
          label: 'nudity',
          confidence: 0.82,
          severity: ModerationSeverity.HIGH,
          status: FlagStatus.OPEN,
        },
        {
          videoId: video.id,
          source: 'automod-v1',
          label: 'spam',
          confidence: 0.41,
          severity: ModerationSeverity.LOW,
          status: FlagStatus.ACKED,
        },
      ],
    });
  }

  const existingActions = await prisma.moderationAction.count({
    where: { videoId: video.id },
  });

  if (existingActions === 0) {
    await prisma.moderationAction.create({
      data: {
        videoId: video.id,
        moderatorId: moderator.id,
        action: ModerationActionType.AGE_RESTRICT,
        reason: 'Sensitive content, requires age gate.',
        policyVersion: 'v1.0',
      },
    });
  }

  const existingQueue = await prisma.moderationQueueItem.count({
    where: { videoId: video.id },
  });

  if (existingQueue === 0) {
    await prisma.moderationQueueItem.create({
      data: {
        videoId: video.id,
        status: QueueStatus.ASSIGNED,
        priority: 80,
        assignedToId: moderator.id,
        assignedAt: new Date(),
      },
    });
  }

  const [categoryCount, activityCount, placeCount] = await Promise.all([
    prisma.category.count(),
    prisma.activity.count(),
    prisma.place.count(),
  ]);

  console.log(
    `[seed] categories=${categoryCount}, activities=${activityCount}, places=${placeCount}`,
  );
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
