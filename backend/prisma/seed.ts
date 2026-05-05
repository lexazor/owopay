import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@owopay.com' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        fullName: 'Admin OwoPay',
        username: 'admin.owopay',
        whatsapp: '+6281234567890',
        email: 'admin@owopay.com',
        password: hashedPassword,
        role: 'ADMIN',
        balance: 0,
        isPinSet: true,
        pin: await bcrypt.hash('123456', 10),
      },
    });
    console.log('Default admin created: admin@owopay.com / admin123, PIN: 123456');
  }

  // Create sample categories
  const categories = [
    { name: 'Pulsa', logo: '', order: 1, badge: null },
    { name: 'E-Wallet', logo: '', order: 2, badge: 'BARU' },
    { name: 'Data Internet', logo: '', order: 3, badge: null },
    { name: 'Token Listrik', logo: '', order: 4, badge: 'PROMO' },
  ];

  for (const cat of categories) {
    const exists = await prisma.category.findFirst({ where: { name: cat.name } });
    if (!exists) {
      await prisma.category.create({ data: cat });
    }
  }

  // Create sample payment method
  const pmExists = await prisma.paymentMethod.findFirst({ where: { name: 'BCA Transfer' } });
  if (!pmExists) {
    await prisma.paymentMethod.create({ data: {
      name: 'BCA Transfer',
      logo: '',
      accountNumber: '1234567890',
      accountName: 'PT OwoPay Digital',
      minAmount: 10000,
      maxAmount: 10000000,
      uniqueCode: true,
      uniqueMin: 100,
      uniqueMax: 999,
      expiredMinutes: 30,
      instructions: 'Transfer ke rekening BCA sesuai nominal + kode unik',
    },
  });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
