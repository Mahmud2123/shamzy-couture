import {
  PrismaClient,
  ProductCategory,
  ProductStatus,
  ProductType,
  MeasureUnit,
  Role,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(
    '🌱 Seeding SHAMZY COUTURE database (Hausa/Nigerian Collection)...'
  );

  // ============================================================
  // 1. ADMIN USER
  // ============================================================

  const adminPassword = await bcrypt.hash('shamzy123', 12);

  await prisma.user.upsert({
    where: {
      email: 'shamzy@gmail.com',
    },

    update: {
      name: 'Shamzy',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },

    create: {
      name: 'Shamzy',
      email: 'shamzy@gmail.com',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin: shamzy@gmail.com / shamzy123');

  // ============================================================
  // 2. PRODUCTS
  // ============================================================

  const products = [
    {
      id: 'shamzy-green-riga',
      name: 'Premium Embroidered Green Babban Riga',
      description:
        'Beautiful dark green Babban Riga with intricate silver and white embroidery detailing along the collar and chest. Perfect for formal occasions and weddings.',
      price: 65000,
      category: ProductCategory.ROBES,
      stock: 5,
      status: ProductStatus.ACTIVE,
      images: ['/images/green-babban-riga.jpg'],
    },

    {
      id: 'shamzy-cream-agbada',
      name: 'Luxury Cream Agbada Set with Matching Kufi',
      description:
        'Handcrafted cream-colored Agbada with detailed geometric embroidery on the neckline and cuffs. Includes matching cap. Premium quality fabric.',
      price: 85000,
      category: ProductCategory.ROBES,
      stock: 3,
      status: ProductStatus.ACTIVE,
      images: ['/images/cream-agbada.jpg'],
    },

    {
      id: 'shamzy-navy-kurta',
      name: 'Classic Navy Blue Kurta with Tassel',
      description:
        'Elegant navy blue kurta with a minimalist chest placket and a matching blue tassel for a refined everyday traditional look.',
      price: 35000,
      category: ProductCategory.ROBES,
      stock: 10,
      status: ProductStatus.ACTIVE,
      images: ['/images/navy-kurta.jpg'],
    },

    {
      id: 'shamzy-sage-kurta',
      name: 'Sage Green Casual Kurta with Silver Tassel',
      description:
        'Modern sage green kurta featuring subtle chest pleating and a silver tassel. A stylish blend of tradition and contemporary fashion.',
      price: 40000,
      category: ProductCategory.ROBES,
      stock: 8,
      status: ProductStatus.ACTIVE,
      images: ['/images/sage-kurta.jpg'],
    },

    {
      id: 'shamzy-abaya-green',
      name: 'Elegant Olive Green Abaya with Beaded Cuffs',
      description:
        'Stunning olive green abaya with delicate beadwork embroidery along the front and spectacular floral beaded cuffs. Comes with matching headscarf.',
      price: 75000,
      category: ProductCategory.ABAYAS,
      stock: 4,
      status: ProductStatus.ACTIVE,
      images: ['/images/green-abaya.jpg'],
    },

    {
      id: 'shamzy-abaya-white',
      name: 'Pure White Embroidered Abaya',
      description:
        'Elegant pure white abaya with subtle stone and bead detailing running down the front. Sophisticated and timeless.',
      price: 70000,
      category: ProductCategory.ABAYAS,
      stock: 4,
      status: ProductStatus.ACTIVE,
      images: ['/images/white-abaya.jpg'],
    },

    {
      id: 'shamzy-abaya-charcoal',
      name: 'Charcoal Grey Beaded Abaya',
      description:
        'Sophisticated charcoal grey abaya featuring beautiful circular bead patterns running vertically down the front and along the sleeves.',
      price: 80000,
      category: ProductCategory.ABAYAS,
      stock: 3,
      status: ProductStatus.ACTIVE,
      images: ['/images/charcoal-abaya.jpg'],
    },

    {
      id: 'shamzy-abaya-blue',
      name: 'Teal Blue Crystal Embellished Abaya',
      description:
        'Vibrant teal blue abaya with glittering crystal detailing down the center. A stunning piece for celebrations.',
      price: 82000,
      category: ProductCategory.ABAYAS,
      stock: 3,
      status: ProductStatus.ACTIVE,
      images: ['/images/teal-abaya.jpg'],
    },

    {
      id: 'shamzy-abaya-caramel',
      name: 'Caramel Brown Embroidered Abaya',
      description:
        'Rich caramel brown abaya with intricate embroidery work, perfect for autumn and evening events. Elegant fit with a matching scarf.',
      price: 78000,
      category: ProductCategory.ABAYAS,
      stock: 3,
      status: ProductStatus.ACTIVE,
      images: ['/images/caramel-abaya.jpg'],
    },

    {
      id: 'shamzy-kufi-knit',
      name: 'Black & White Geometric Kufi Cap',
      description:
        'Traditional knitted kufi cap with a striking black and white diamond geometric pattern. Size 23.5 inches.',
      price: 8000,
      category: ProductCategory.ACCESSORIES,
      stock: 20,
      status: ProductStatus.ACTIVE,
      images: ['/images/kufi-knit.jpg'],
    },

    {
      id: 'shamzy-kufi-set',
      name: 'Woven Kufi Cap Set (3 Colors)',
      description:
        'Set of 3 woven kufi caps with traditional diamond patterns. Comes in beige/black, blue/multicolor, and brown/black. Size 22.5 inches.',
      price: 15000,
      category: ProductCategory.ACCESSORIES,
      stock: 10,
      status: ProductStatus.ACTIVE,
      images: ['/images/kufi-set.jpg'],
    },

    {
      id: 'shamzy-sandals-grey',
      name: 'Luxury Grey Leather Sandals with Buckle',
      description:
        'Premium grey leather slide sandals with a modern criss-cross strap and silver metallic buckle. Perfect for pairing with Babban Riga.',
      price: 25000,
      category: ProductCategory.FOOTWEAR,
      stock: 12,
      status: ProductStatus.ACTIVE,
      images: ['/images/grey-sandals.jpg'],
    },

    {
      id: 'shamzy-sandals-olive',
      name: 'Olive Green Textured Leather Sandals',
      description:
        'Stylish olive green cross-strap sandals made from textured leather. A fashionable matching piece for traditional attire.',
      price: 22000,
      category: ProductCategory.FOOTWEAR,
      stock: 12,
      status: ProductStatus.ACTIVE,
      images: ['/images/olive-sandals.jpg'],
    },
  ];

  // ============================================================
  // SEED PRODUCTS
  // ============================================================

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        id: product.id,
      },

      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        images: product.images,
      },

      create: product,
    });
  }

  console.log(`✅ ${products.length} products seeded`);

  // ============================================================
  // 3. DEMO CUSTOMER
  // ============================================================

  const customerPassword = await bcrypt.hash('shamzy123', 12);

  const customer = await prisma.user.upsert({
    where: {
      email: 'shamaki@gmail.com',
    },

    update: {
      name: 'Demo Customer',
      password: customerPassword,
      role: Role.CUSTOMER,
      isActive: true,
    },

    create: {
      name: 'Demo Customer',
      email: 'shamaki@gmail.com',
      password: customerPassword,
      role: Role.CUSTOMER,
      isActive: true,
    },
  });

  console.log('✅ Customer: shamaki@gmail.com / shamzy123');

  // ============================================================
  // 4. SAMPLE MEASUREMENT - BABBAN RIGA
  // ============================================================

  await prisma.measurement.upsert({
    where: {
      id: 'sample-m-riga',
    },

    update: {
      userId: customer.id,
      name: 'Custom Babban Riga',
      productType: ProductType.ROBES,
      unit: MeasureUnit.CM,
      isDefault: true,
      measurements: {
        chest: 112,
        waist: 96,
        hips: 104,
        shoulder: 48,
        sleeve: 68,
        length: 145,
        cuff: 30,
      },
    },

    create: {
      id: 'sample-m-riga',
      userId: customer.id,
      name: 'Custom Babban Riga',
      productType: ProductType.ROBES,
      unit: MeasureUnit.CM,
      isDefault: true,
      measurements: {
        chest: 112,
        waist: 96,
        hips: 104,
        shoulder: 48,
        sleeve: 68,
        length: 145,
        cuff: 30,
      },
    },
  });

  // ============================================================
  // 5. SAMPLE MEASUREMENT - ABAYA
  // ============================================================

  await prisma.measurement.upsert({
    where: {
      id: 'sample-m-abaya',
    },

    update: {
      userId: customer.id,
      name: 'Custom Abaya',
      productType: ProductType.ABAYAS,
      unit: MeasureUnit.CM,
      isDefault: true,
      measurements: {
        chest: 106,
        waist: 92,
        hips: 110,
        shoulder: 42,
        sleeve: 62,
        length: 150,
        cuff: 24,
      },
    },

    create: {
      id: 'sample-m-abaya',
      userId: customer.id,
      name: 'Custom Abaya',
      productType: ProductType.ABAYAS,
      unit: MeasureUnit.CM,
      isDefault: true,
      measurements: {
        chest: 106,
        waist: 92,
        hips: 110,
        shoulder: 42,
        sleeve: 62,
        length: 150,
        cuff: 24,
      },
    },
  });

  console.log('✅ Sample measurements seeded');

  // ============================================================
  // 6. COMPLETE
  // ============================================================

  console.log('');
  console.log(
    '🎉 SHAMZY COUTURE (Hausa/Nigerian Collection) seeding complete!'
  );
  console.log('');
  console.log('Login accounts:');
  console.log('Admin:    shamzy@gmail.com / shamzy123');
  console.log('Customer: shamaki@gmail.com / shamzy123');
}

// ============================================================
// EXECUTE SEED
// ============================================================

main()
  .catch((error) => {
    console.error('');
    console.error('❌ SEED ERROR:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
