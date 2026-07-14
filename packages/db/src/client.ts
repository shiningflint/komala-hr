import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __komalaPrisma: PrismaClient | undefined;
}

export const prisma = global.__komalaPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__komalaPrisma = prisma;
}

export * from "@prisma/client";
