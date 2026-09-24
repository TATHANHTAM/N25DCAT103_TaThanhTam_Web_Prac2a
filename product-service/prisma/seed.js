const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const mobile = await prisma.category.upsert({
    where: { slug: "mobile" },
    update: {},
    create: {
      name: "Điện thoại",
      slug: "mobile",
      description: "Điện thoại thông minh",
    },
  });

  const products = [
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      price: 27990000,
      stock: 50,
      categoryId: mobile.id,
    },
    {
      name: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      price: 22990000,
      stock: 30,
      categoryId: mobile.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log("Seed product-service thành công");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

