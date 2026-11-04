const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@livekaratuwa.local' },
    update: {},
    create: {
      email: 'admin@livekaratuwa.local',
      password: hashedPassword,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create 12 garden boxes with multilingual content
  console.log('📦 Creating garden boxes...');
  
  const boxes = [
    {
      number: 1,
      name_en: "Tomatoes",
      name_si: "තක්කාලි",
      name_zh: "番茄",
      description_en: "Freshly grown organic tomatoes rich in nutrients and antioxidants.",
      description_si: "පොහොසත් පෝෂක සහිත කෘෂි මෙන්ම පිරිසිදු තක්කාලි.",
      description_zh: "天然有机番茄，营养丰富，富含抗氧化剂。"
    },
    {
      number: 2,
      name_en: "Bell Peppers",
      name_si: "ගම්මිරිස්",
      name_zh: "甜椒",
      description_en: "Colorful bell peppers in red, yellow, and green varieties.",
      description_si: "රතු, කහ සහ කොළ වර්ණවල ගම්මිරිස් වර්ග.",
      description_zh: "多彩甜椒，有红、黄、绿等不同颜色品种。"
    },
    {
      number: 3,
      name_en: "Lettuce",
      name_si: "ලෙටුස්",
      name_zh: "生菜",
      description_en: "Crisp, fresh lettuce perfect for salads and sandwiches.",
      description_si: "සැලඩ් සහ සැන්ඩ්විච් සඳහා සුදුසු තරුණ ලෙටුස්.",
      description_zh: "脆嫩新鲜的生菜，非常适合制作沙拉和三明治。"
    },
    {
      number: 4,
      name_en: "Carrots",
      name_si: "කැරට්",
      name_zh: "胡萝卜",
      description_en: "Sweet, crunchy carrots packed with beta-carotene and vitamins.",
      description_si: "බීටා-කැරොටීන් සහ විටමින් සහිත මිහිරි කැරට්.",
      description_zh: "香甜脆嫩的胡萝卜，富含β-胡萝卜素和维生素。"
    },
    {
      number: 5,
      name_en: "Cucumbers",
      name_si: "පිපිංගු",
      name_zh: "黄瓜",
      description_en: "Cool, refreshing cucumbers ideal for summer salads.",
      description_si: "ගිම්හාන සැලඩ් සඳහා සුදුසු සිසිල් පිපිංගු.",
      description_zh: "清爽的黄瓜，非常适合制作夏季沙拉。"
    },
    {
      number: 6,
      name_en: "Spinach",
      name_si: "නිවිති",
      name_zh: "菠菜",
      description_en: "Nutrient-dense spinach rich in iron and folate.",
      description_si: "යකඩ සහ ෆොලේට් සහිත පෝෂණ සහිත නිවිති.",
      description_zh: "营养丰富的菠菜，富含铁和叶酸。"
    },
    {
      number: 7,
      name_en: "Basil",
      name_si: "මදුරු",
      name_zh: "罗勒",
      description_en: "Aromatic basil perfect for Italian dishes and pesto.",
      description_si: "ඉතාලි ආහාර සහ පෙස්ටෝ සඳහා සුදුසු සුවඳ විලවුන් මදුරු.",
      description_zh: "芳香罗勒，非常适合制作意大利菜和香蒜酱。"
    },
    {
      number: 8,
      name_en: "Mint",
      name_si: "පුදින",
      name_zh: "薄荷",
      description_en: "Fresh mint leaves perfect for teas and refreshing drinks.",
      description_si: "තේ සහ සිසිල් පාන සඳහා සුදුසු නැවුම් පුදින කොළ.",
      description_zh: "新鲜薄荷叶，非常适合泡茶和制作清爽饮品。"
    },
    {
      number: 9,
      name_en: "Onions",
      name_si: "ලූණු",
      name_zh: "洋葱",
      description_en: "Essential cooking onions with strong flavor and aroma.",
      description_si: "ශක්තිමත් රසයක් සහ සුවඳක් සහිත ආහාර පිසීමේ ලූණු.",
      description_zh: "烹饪必备洋葱，味道浓郁，香气扑鼻。"
    },
    {
      number: 10,
      name_en: "Garlic",
      name_si: "සුදු ලූණු",
      name_zh: "大蒜",
      description_en: "Pungent garlic cloves essential for flavoring dishes.",
      description_si: "ආහාර වලට රසයක් එකතු කිරීම සඳහා අත්‍යවශ්‍ය සුදු ලූණු.",
      description_zh: "辛辣大蒜瓣，为菜肴增添风味的重要调料。"
    },
    {
      number: 11,
      name_en: "Green Beans",
      name_si: "බෝංචි",
      name_zh: "青豆",
      description_en: "Tender green beans rich in fiber and protein.",
      description_si: "ඉතාමත් තරුණ බෝංචි තන්තු සහ ප්‍රෝටීන් සහිත.",
      description_zh: "嫩绿青豆，富含纤维和蛋白质。"
    },
    {
      number: 12,
      name_en: "Radishes",
      name_si: "රැඩිෂ්",
      name_zh: "萝卜",
      description_en: "Crisp, peppery radishes perfect for salads and garnishes.",
      description_si: "සැලඩ් සහ ගර්නිෂ් සඳහා සුදුසු තරුණ රැඩිෂ්.",
      description_zh: "脆嫩辛辣的萝卜，非常适合制作沙拉和装饰。"
    }
  ];

  for (const boxData of boxes) {
    const box = await prisma.box.upsert({
      where: { number: boxData.number },
      update: {},
      create: {
        number: boxData.number,
        name: boxData.name_en,
        description: boxData.description_en,
        mainImage: '/uploads/boxes/default.jpg' // Default image path
      },
    });
    console.log(`✅ Box ${box.number} created: ${boxData.name_en}`);
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`📊 Created ${boxes.length} garden boxes and 1 admin user`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });