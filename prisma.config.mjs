// prisma.config.mjs
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Prisma skeemi asukoht
  schema: "prisma/schema.prisma",

  // Migratsioonid (saab hiljem sättida, kui tahad seed'i jms)
  migrations: {
    path: "prisma/migrations",
    // seed: 'node prisma/seed.js',  // kui sul on seedi skript
  },

  // Andmebaasi ühendus CLI jaoks (migrate, studio, db push jne)
  datasource: {
    url: env("DATABASE_URL"),
    // Kui sul on shadow DB:
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
});
