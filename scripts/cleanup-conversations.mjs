#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const result = await prisma.conversation.deleteMany({
    where: {
      isPinned: false,
      expiresAt: {
        lte: now,
      },
    },
  });
  console.log(`[cleanup-conversations] removed ${result.count} expired conversations`);
}

main()
  .catch((err) => {
    console.error("[cleanup-conversations] failed", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
