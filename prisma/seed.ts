import { PrismaClient } from '@prisma/client';
import { runSeed } from './seed/run';

const db = new PrismaClient();
const force = process.argv.includes('--force');

runSeed(db, { force })
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
