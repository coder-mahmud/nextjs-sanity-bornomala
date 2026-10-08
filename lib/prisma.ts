// import { PrismaClient } from "@/prisma/generated/prisma/client"
// import { withAccelerate } from "@prisma/extension-accelerate"
 
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
 
// export const prisma =
//   globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())
 
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

import { PrismaClient } from "@/prisma/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => {
  return new PrismaClient().$extends(withAccelerate());
};

type PrismaClientExtended = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientExtended | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;