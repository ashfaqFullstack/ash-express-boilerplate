/**
 * @file prisma.config.ts
 * @description Root TypeScript configuration for Prisma ORM v7, defining schema paths,
 * migrations, and the database URL datasource (read from environment).
 */

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: process.env.DATABASE_URL || '',
    },
});
