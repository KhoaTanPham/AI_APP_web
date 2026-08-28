import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  ['iPhone 16', 'Apple', 799, 'A powerful new generation phone with an all-day battery.', '6.1 inch Super Retina XDR|A18 chip|48MP Fusion camera'],
  ['Galaxy S25', 'Samsung', 799, 'A refined flagship experience with intelligent tools.', '6.2 inch Dynamic AMOLED 2X|Snapdragon 8 Elite|50MP wide camera'],
  ['Pixel 9', 'Google', 699, 'Google AI meets a brilliant camera and smooth Android.', '6.3 inch Actua display|Google Tensor G4|50MP main camera'],
  ['Xiaomi 15', 'Xiaomi', 599, 'Flagship speed and a Leica-inspired camera system.', '6.36 inch CrystalRes AMOLED|Snapdragon 8 Elite|Leica camera'],
  ['OnePlus 13', 'OnePlus', 699, 'Fast, fluid and distinctive with a huge battery.', '6.82 inch 2K display|Snapdragon 8 Elite|6000mAh battery'],
] as const

for (const [name, brand, price, description, specifications] of products) {
  await prisma.product.upsert({
    where: { name },
    update: { stockQuantity: 10 },
    create: { name, brand, price, description, specifications, stockQuantity: 10, imageUrl: '' },
  })
}

await prisma.$disconnect()
