import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SHAMZY COUTURE database...');

  const adminPassword = await bcrypt.hash('shamzy123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'shamzy@shamzycouture.com' },
    update: {},
    create: { name: 'Shamzy', email: 'shamzy@shamzycouture.com', password: adminPassword, role: 'ADMIN' },
  });
  console.log('✅ Admin: shamzy@shamzycouture.com / shamzy123');

  const products = [
    { id: 'shamzy-suit-1', name: 'Signature Bespoke Suit', description: 'Handcrafted from premium Italian wool. Modern slim fit, fully canvassed construction, hand-stitched lapels.', price: 899.99, category: 'SUITS' as const, stock: 8, status: 'ACTIVE' as const, images: ['/images/suit-1.png'] },
    { id: 'shamzy-suit-2', name: 'Classic Navy Blazer Suit', description: 'Timeless navy blazer suit, expertly tailored. High-quality worsted wool with a subtle sheen.', price: 749.99, category: 'SUITS' as const, stock: 6, status: 'ACTIVE' as const, images: ['/images/suit-2.jpg'] },
    { id: 'shamzy-jacket-1', name: 'Premium Leather Moto Jacket', description: 'Full-grain Italian leather, slim fit, asymmetric zipper, quilted shoulders. Built to last a lifetime.', price: 499.99, category: 'JACKETS' as const, stock: 7, status: 'ACTIVE' as const, images: ['/images/jacket-1.png'] },
    { id: 'shamzy-jacket-2', name: 'Wool Cashmere Overcoat', description: 'Premium wool and cashmere blend. Classic tailored fit, notched lapels, satin lining.', price: 649.99, category: 'JACKETS' as const, stock: 4, status: 'ACTIVE' as const, images: ['/images/jacket-2.png'] },
    { id: 'shamzy-shirt-1', name: 'Custom-Fit Dress Shirt', description: 'Premium Egyptian cotton, made to your exact measurements. Various collar and cuff options.', price: 199.99, category: 'SHIRTS' as const, stock: 15, status: 'ACTIVE' as const, images: ['/images/shirt-1.png'] },
    { id: 'shamzy-shirt-2', name: 'Italian Silk Blouse', description: 'Finest Italian silk fabric. Classic button-front design with a soft sheen.', price: 249.99, category: 'SHIRTS' as const, stock: 10, status: 'ACTIVE' as const, images: ['/images/shirt-2.png'] },
    { id: 'shamzy-trouser-1', name: 'Tailored Wool Trousers', description: 'Expertly crafted from fine wool. Classic straight cut with adjustable waistband.', price: 299.99, category: 'TROUSERS' as const, stock: 9, status: 'ACTIVE' as const, images: ['/images/trouser-1.png'] },
    { id: 'shamzy-accessory-1', name: 'Handmade Silk Tie Collection', description: 'Curated collection of handmade silk ties in various patterns. 100% pure silk. Set of 3.', price: 149.99, category: 'ACCESSORIES' as const, stock: 20, status: 'ACTIVE' as const, images: ['/images/accessory-1.png'] },
    { id: 'shamzy-accessory-2', name: 'Leather Belt & Wallet Set', description: 'Premium full-grain leather, hand-stitched with brass hardware.', price: 129.99, category: 'ACCESSORIES' as const, stock: 12, status: 'ACTIVE' as const, images: ['/images/accessory-2.png'] },
    { id: 'shamzy-custom-1', name: 'Luxury Wedding Gown', description: 'Breathtaking custom-designed gown with intricate lace details and dramatic cathedral train.', price: 1599.99, category: 'CUSTOM' as const, stock: 3, status: 'ACTIVE' as const, images: ['/images/dress-1.png'] },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log(`✅ ${products.length} products seeded`);

  const userPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: { name: 'Demo Customer', email: 'customer@example.com', password: userPassword, role: 'CUSTOMER' },
  });
  console.log('✅ Customer: customer@example.com / customer123');

  // Sample measurements
  await prisma.measurement.upsert({
    where: { id: 'sample-m-suit' },
    update: {},
    create: {
      id: 'sample-m-suit', userId: customer.id, name: 'Work Suit', productType: 'SUIT', unit: 'CM', isDefault: true,
      measurements: { chest: 102, waist: 86, hips: 100, shoulder: 46, sleeve: 64, length: 76, jacketLength: 74, trouserWaist: 84, inseam: 81, outseam: 107 },
    },
  });
  await prisma.measurement.upsert({
    where: { id: 'sample-m-shirt' },
    update: {},
    create: {
      id: 'sample-m-shirt', userId: customer.id, name: 'Casual Shirts', productType: 'SHIRT', unit: 'CM', isDefault: true,
      measurements: { collar: 40, chest: 104, waist: 88, shoulder: 46, sleeve: 65, length: 78, cuff: 25 },
    },
  });
  console.log('✅ Sample measurements seeded');

  console.log('\n🎉 SHAMZY COUTURE seeding complete!');
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
