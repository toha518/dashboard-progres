import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed Admin
  const hashedPassword = await bcrypt.hash("se2026_1900", 12);
  await prisma.admin.upsert({
    where: { username: "admin_se2026" },
    update: {},
    create: {
      username: "admin_se2026",
      password: hashedPassword,
    },
  });

  // Seed Regions with codes and order
  const regions = [
    { code: "1901", name: "Bangka",         type: "kabupaten", order: 1 },
    { code: "1902", name: "Belitung",       type: "kabupaten", order: 2 },
    { code: "1903", name: "Bangka Barat",   type: "kabupaten", order: 3 },
    { code: "1904", name: "Bangka Tengah",  type: "kabupaten", order: 4 },
    { code: "1905", name: "Bangka Selatan", type: "kabupaten", order: 5 },
    { code: "1906", name: "Belitung Timur", type: "kabupaten", order: 6 },
    { code: "1971", name: "Pangkalpinang",  type: "kota",      order: 7 },
    { code: "1900", name: "Provinsi",       type: "provinsi",  order: 8 },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: region,
    });
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
