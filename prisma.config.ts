import { defineConfig, env } from '@prisma/config';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
});
