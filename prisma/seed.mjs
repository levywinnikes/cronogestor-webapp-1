import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  // --- Test Credentials from Login Screen ---
  const testPasswordHash = await bcrypt.hash("123456", 10);

  const freeCompany = await prisma.company.upsert({
    where: { email: "free@cronogestor.local" },
    update: {},
    create: {
      personType: "PF",
      document: "98765432100",
      name: "Conta Grátis",
      email: "free@cronogestor.local",
      planType: "FREE",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@obras.com" },
    update: { passwordHash: testPasswordHash, role: "ADMIN", isActive: true },
    create: {
      companyId: company.id,
      name: "Admin Obras",
      email: "admin@obras.com",
      passwordHash: testPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "funcionario@obras.com" },
    update: { passwordHash: testPasswordHash, role: "EMPLOYEE", isActive: true, companyId: freeCompany.id },
    create: {
      companyId: freeCompany.id,
      name: "Funcionario Obras",
      email: "funcionario@obras.com",
      passwordHash: testPasswordHash,
      role: "EMPLOYEE",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "demitido@obras.com" },
    update: { passwordHash: testPasswordHash, role: "EMPLOYEE", isActive: false },
    create: {
      companyId: company.id,
      name: "Inativo Obras",
      email: "demitido@obras.com",
      passwordHash: testPasswordHash,
      role: "EMPLOYEE",
      isActive: false,
    },
  });
  // ------------------------------------------

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
