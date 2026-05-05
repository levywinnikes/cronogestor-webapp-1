import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL nao configurada no ambiente.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrador";
  const adminPasswordHash = process.env.SEED_ADMIN_PASSWORD_HASH;

  const company = await prisma.company.upsert({
    where: { email: "empresa@cronogestor.local" },
    update: {},
    create: {
      personType: "PJ",
      document: "00000000000000",
      name: "Empresa Cronogestor",
      email: "empresa@cronogestor.local",
      planType: "PREMIUM",
      isActive: true,
    },
  });

  if (adminEmail && adminPasswordHash) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        role: "ADMIN",
        isActive: true,
      },
      create: {
        companyId: company.id,
        name: adminName,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        isActive: true,
      },
    });
  } else {
    console.warn(
      "Seed de usuario admin ignorado: defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD_HASH.",
    );
  }

  console.log("Seed concluido com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
