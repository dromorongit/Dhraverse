require('dotenv').config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hashPassword } from '../lib/auth'

console.log('DATABASE_URL:', process.env.DATABASE_URL)

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dhraverse.com' },
    update: {},
    create: {
      email: 'admin@dhraverse.com',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  })

  // Create vendor user
  const vendorPassword = await hashPassword('vendor123')
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@dhraverse.com' },
    update: {},
    create: {
      email: 'vendor@dhraverse.com',
      password: vendorPassword,
      role: 'VENDOR',
      profile: {
        create: {
          firstName: 'Vendor',
          lastName: 'User',
        },
      },
      store: {
        create: {
          name: 'TechStore',
          description: 'Your trusted source for electronics',
        },
      },
    },
    include: {
      store: true,
    },
  })

  // Create customer user
  const customerPassword = await hashPassword('customer123')
  const customer = await prisma.user.upsert({
    where: { email: 'customer@dhraverse.com' },
    update: {},
    create: {
      email: 'customer@dhraverse.com',
      password: customerPassword,
      role: 'CUSTOMER',
      profile: {
        create: {
          firstName: 'Customer',
          lastName: 'User',
        },
      },
    },
  })

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { id: 'electronics' },
    update: {},
    create: {
      id: 'electronics',
      name: 'Electronics',
    },
  })

  const services = await prisma.category.upsert({
    where: { id: 'services' },
    update: {},
    create: {
      id: 'services',
      name: 'Services',
    },
  })

  const fashion = await prisma.category.upsert({
    where: { id: 'fashion' },
    update: {},
    create: {
      id: 'fashion',
      name: 'Fashion',
    },
  })

  const home = await prisma.category.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
      name: 'Home & Living',
    },
  })

  const sports = await prisma.category.upsert({
    where: { id: 'sports' },
    update: {},
    create: {
      id: 'sports',
      name: 'Sports & Outdoors',
    },
  })

  const beauty = await prisma.category.upsert({
    where: { id: 'beauty' },
    update: {},
    create: {
      id: 'beauty',
      name: 'Beauty & Personal Care',
    },
  })

  // Create additional vendor stores for more realistic demo data
  const vendor2Password = await hashPassword('vendor2pass')
  const vendor2 = await prisma.user.upsert({
    where: { email: 'vendor2@dhraverse.com' },
    update: {},
    create: {
      email: 'vendor2@dhraverse.com',
      password: vendor2Password,
      role: 'VENDOR',
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Mensah',
        },
      },
      store: {
        create: {
          name: 'StyleHub Boutique',
          description: 'Trendy fashion and accessories for the modern person',
        },
      },
    },
    include: {
      store: true,
    },
  })

  const vendor3Password = await hashPassword('vendor3pass')
  const vendor3 = await prisma.user.upsert({
    where: { email: 'vendor3@dhraverse.com' },
    update: {},
    create: {
      email: 'vendor3@dhraverse.com',
      password: vendor3Password,
      role: 'VENDOR',
      profile: {
        create: {
          firstName: 'Kwame',
          lastName: 'Asante',
        },
      },
      store: {
        create: {
          name: 'HomeEssentials GH',
          description: 'Quality home goods and lifestyle products',
        },
      },
    },
    include: {
      store: true,
    },
  })

  // Create products for TechStore (vendor)
  if (vendor.store) {
    await prisma.product.upsert({
      where: { id: 'laptop-1' },
      update: {},
      create: {
        id: 'laptop-1',
        storeId: vendor.store.id,
        categoryId: electronics.id,
        name: 'Gaming Laptop Pro X1',
        description: 'High-performance gaming laptop with RTX 4070, 32GB RAM, and 1TB SSD. Perfect for gaming and content creation.',
        price: 1299.99,
        stock: 10,
      },
    })

    await prisma.product.upsert({
      where: { id: 'phone-1' },
      update: {},
      create: {
        id: 'phone-1',
        storeId: vendor.store.id,
        categoryId: electronics.id,
        name: 'Smartphone Ultra 15 Pro',
        description: 'Latest flagship smartphone with 200MP camera, 5G, and all-day battery life. Available in midnight black and pearl white.',
        price: 899.99,
        stock: 25,
      },
    })

    await prisma.product.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        storeId: vendor.store.id,
        categoryId: services.id,
        name: 'Web Development Service',
        description: 'Professional custom web development services including design, development, and deployment. Starting from GH₵500.',
        price: 500.00,
        stock: 1,
      },
    })

    await prisma.product.upsert({
      where: { id: 'tablet-1' },
      update: {},
      create: {
        id: 'tablet-1',
        storeId: vendor.store.id,
        categoryId: electronics.id,
        name: 'Premium Tablet 12.9"',
        description: 'Lightweight tablet with stunning display, perfect for reading, browsing, and light productivity tasks.',
        price: 449.99,
        stock: 15,
      },
    })

    await prisma.product.upsert({
      where: { id: 'headphones-1' },
      update: {},
      create: {
        id: 'headphones-1',
        storeId: vendor.store.id,
        categoryId: electronics.id,
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
        price: 199.99,
        stock: 30,
      },
    })
  }

  // Create products for StyleHub Boutique (vendor2)
  if (vendor2.store) {
    await prisma.product.upsert({
      where: { id: 'dress-1' },
      update: {},
      create: {
        id: 'dress-1',
        storeId: vendor2.store.id,
        categoryId: fashion.id,
        name: 'Classic Maxi Dress',
        description: 'Elegant flowing maxi dress perfect for evening events and special occasions. Available in multiple colors.',
        price: 89.99,
        stock: 20,
      },
    })

    await prisma.product.upsert({
      where: { id: 'shoes-1' },
      update: {},
      create: {
        id: 'shoes-1',
        storeId: vendor2.store.id,
        categoryId: fashion.id,
        name: 'Leather Loafers',
        description: 'Handcrafted genuine leather loafers with cushioned insole for all-day comfort.',
        price: 129.99,
        stock: 15,
      },
    })

    await prisma.product.upsert({
      where: { id: 'bag-1' },
      update: {},
      create: {
        id: 'bag-1',
        storeId: vendor2.store.id,
        categoryId: fashion.id,
        name: 'Designer Handbag',
        description: 'Stylish crossbody bag with multiple compartments and adjustable strap. Vegan leather option available.',
        price: 79.99,
        stock: 25,
      },
    })

    await prisma.product.upsert({
      where: { id: 'watch-1' },
      update: {},
      create: {
        id: 'watch-1',
        storeId: vendor2.store.id,
        categoryId: fashion.id,
        name: 'Minimalist Watch',
        description: 'Sleek stainless steel watch with genuine leather strap. Water resistant up to 50m.',
        price: 149.99,
        stock: 12,
      },
    })
  }

  // Create products for HomeEssentials GH (vendor3)
  if (vendor3.store) {
    await prisma.product.upsert({
      where: { id: 'lamp-1' },
      update: {},
      create: {
        id: 'lamp-1',
        storeId: vendor3.store.id,
        categoryId: home.id,
        name: 'Modern Table Lamp',
        description: 'Adjustable LED table lamp with touch controls and warm lighting. Perfect for bedside or desk use.',
        price: 45.99,
        stock: 30,
      },
    })

    await prisma.product.upsert({
      where: { id: 'cushion-1' },
      update: {},
      create: {
        id: 'cushion-1',
        storeId: vendor3.store.id,
        categoryId: home.id,
        name: 'Decorative Throw Pillows Set',
        description: 'Set of 4 decorative throw pillows in various textures and patterns. Machine washable covers.',
        price: 34.99,
        stock: 40,
      },
    })

    await prisma.product.upsert({
      where: { id: 'yoga-1' },
      update: {},
      create: {
        id: 'yoga-1',
        storeId: vendor3.store.id,
        categoryId: sports.id,
        name: 'Premium Yoga Mat',
        description: 'Extra thick non-slip yoga mat with carrying strap. Eco-friendly TPE material, 6mm thickness.',
        price: 29.99,
        stock: 50,
      },
    })

    await prisma.product.upsert({
      where: { id: 'skincare-1' },
      update: {},
      create: {
        id: 'skincare-1',
        storeId: vendor3.store.id,
        categoryId: beauty.id,
        name: 'Natural Face Serum Set',
        description: 'Organic vitamin C and hyaluronic acid serum set for glowing, hydrated skin. Suitable for all skin types.',
        price: 59.99,
        stock: 35,
      },
    })
  }

  console.log('Seed data created successfully')
  console.log('Admin: admin@dhraverse.com / admin123')
  console.log('Vendor: vendor@dhraverse.com / vendor123')
  console.log('Customer: customer@dhraverse.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })