import { PrismaClient } from "@prisma/client";

const prismaClients: Record<string, PrismaClient> = {};

export function getPrisma(companyId: string) {
  if (!companyId) {
    companyId = process.env.DEFAULT_COMPANY;
  }

  if (!prismaClients[companyId]) {
    const databaseUrl = getDatabaseUrl(companyId);

    prismaClients[companyId] = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  return prismaClients[companyId];
}

function getDatabaseUrl(companyId: string) {
  switch (companyId) {
    case "DU":
      return process.env.DU_DATABASE_URL!;

    case "VI":
      return process.env.VI_DATABASE_URL!;

    default:
      return process.env.DEFAULT_DATABASE_URL!;
  }
}
