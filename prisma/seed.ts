import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

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

  // Create products
  if (vendor.store) {
    await prisma.product.upsert({
      where: { id: 'laptop-1' },
      update: {},
      create: {
        id: 'laptop-1',
        storeId: vendor.store.id,
        categoryId: electronics.id,
        name: 'Gaming Laptop Pro',
        description: 'High-performance gaming laptop with latest specs',
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
        name: 'Smartphone Ultra',
        description: 'Latest smartphone with advanced features',
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
        description: 'Professional web development services',
        price: 500.00,
        stock: 1,
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