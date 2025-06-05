import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrator with full access to all features',
    },
    {
      name: 'EXECUTIVE',
      description: 'Executive with access to management features',
    },
    {
      name: 'TELECALLER',
      description: 'Telecaller with access to calling and basic CRM features',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`Created/Updated role: ${role.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
