import path from 'path';

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('file:')) {
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database via Prisma...');

  // 1. Create Demo User
  const demoEmail = 'demo@example.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log(`User created/found: ${user.email} (${user.id})`);

  // 2. Create Sample Activities
  const sampleActivities = [
    {
      url: 'https://github.com/trending',
      title: 'Trending repositories on GitHub today',
      activeTime: 420,
      timestamp: new Date(Date.now() - 3600 * 1000 * 2),
    },
    {
      url: 'https://news.ycombinator.com',
      title: 'Hacker News',
      activeTime: 240,
      timestamp: new Date(Date.now() - 3600 * 1000 * 4),
    },
    {
      url: 'https://stackoverflow.com/questions/react-hooks',
      title: 'React Hooks best practices - Stack Overflow',
      activeTime: 600,
      timestamp: new Date(Date.now() - 3600 * 1000 * 1),
    },
    {
      url: 'https://docs.prisma.io/getting-started',
      title: 'Prisma Documentation & Quickstart',
      activeTime: 310,
      timestamp: new Date(Date.now() - 1800 * 1000),
    },
  ];

  for (const act of sampleActivities) {
    await prisma.activity.create({
      data: {
        userId: user.id,
        url: act.url,
        title: act.title,
        activeTime: act.activeTime,
        timestamp: act.timestamp,
      },
    });
  }

  // 3. Create Sample Screenshot
  await prisma.screenshot.create({
    data: {
      userId: user.id,
      pageUrl: 'https://github.com/trending',
      pageTitle: 'Trending repositories on GitHub today',
      imageUrl: 'https://placehold.co/800x450/1e293b/e2e8f0?text=GitHub+Trending+Screenshot',
      timestamp: new Date(Date.now() - 3600 * 1000 * 2),
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
