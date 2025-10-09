import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing properties...');
  await prisma.property.deleteMany();

  console.log('Seeding properties...');
  await prisma.property.createMany({
    data: [
      { name: 'Seaside Villa', address: '1 Ocean Dr, Nice', description: 'Sea view' },
      { name: 'Mountain Cabin', address: '12 High Peak Rd', description: 'Cozy cabin' },
      { name: 'City Flat', address: '45 Center St', description: 'Close to amenities' },
    ],
  });

  console.log('Seeding done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
