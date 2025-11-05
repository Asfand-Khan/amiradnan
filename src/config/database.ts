import { PrismaClient } from "@prisma/client";
import logger from "../config/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// main prisma client
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn", "info"],
  });

// Custom log handler for Prisma events
// @ts-ignore
prisma.$on("query", async (e: any) => {
  logger.info(`Prisma Query: ${e.query} - Params: ${e.params}`);
});
// @ts-ignore
prisma.$on("info", (e: any) => {
  logger.info(`Prisma Info: ${e.message}`);
});
// @ts-ignore
prisma.$on("warn", (e: any) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});
// @ts-ignore
prisma.$on("error", (e: any) => {
  logger.error(`Prisma Error: ${e.message}`);
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
