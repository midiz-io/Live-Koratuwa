const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with new schema...');

  // Step 1: Create Languages
  console.log('\n📚 Creating languages...');
  
  const languagesData = [
    { code: 'en', name: 'English', nativeName: 'English', isDefault: true, isActive: true },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', isDefault: false, isActive: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', isDefault: false, isActive: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', isDefault: false, isActive: true },
    { code: 'fr', name: 'French', nativeName: 'Français', isDefault: false, isActive: true },
    { code: 'de', name: 'German', nativeName: 'Deutsch', isDefault: false, isActive: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', isDefault: false, isActive: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', isDefault: false, isActive: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isDefault: false, isActive: true },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', isDefault: false, isActive: true },
  ];

  const languages = {};
  for (const langData of languagesData) {
    const language = await prisma.language.upsert({
      where: { code: langData.code },
      update: langData,
      create: langData,
    });
    languages[langData.code] = language;
    console.log(`✅ Language: ${language.name} (${language.code}) ${language.isDefault ? '- DEFAULT' : ''}`);
  }

  // Step 2: Create Admin User
  console.log('\n👤 Creating admin user...');
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

  // Step 3: Create Garden Boxes with English (default) content
  console.log('\n📦 Creating garden boxes with English content...');
  
  const boxesData = [
    {
      number: 1,
      name: "Tomatoes",
      description: "Freshly grown organic tomatoes rich in nutrients and antioxidants."
    },
    {
      number: 2,
      name: "Bell Peppers",
      description: "Colorful bell peppers in red, yellow, and green varieties."
    },
    {
      number: 3,
      name: "Lettuce",
      description: "Crisp, fresh lettuce perfect for salads and sandwiches."
    },
    {
      number: 4,
      name: "Carrots",
      description: "Sweet, crunchy carrots packed with beta-carotene and vitamins."
    },
    {
      number: 5,
      name: "Cucumbers",
      description: "Cool, refreshing cucumbers ideal for summer salads."
    },
    {
      number: 6,
      name: "Spinach",
      description: "Nutrient-dense spinach rich in iron and folate."
    },
    {
      number: 7,
      name: "Basil",
      description: "Aromatic basil perfect for Italian dishes and pesto."
    },
    {
      number: 8,
      name: "Mint",
      description: "Fresh mint leaves perfect for teas and refreshing drinks."
    },
    {
      number: 9,
      name: "Chili Peppers",
      description: "Spicy chili peppers for adding heat to your favorite dishes."
    },
    {
      number: 10,
      name: "Eggplant",
      description: "Versatile eggplant perfect for grilling, baking, or stir-frying."
    },
    {
      number: 11,
      name: "Zucchini",
      description: "Fresh zucchini great for roasting, grilling, or making noodles."
    },
    {
      number: 12,
      name: "Herbs Mix",
      description: "A variety of fresh herbs including parsley, cilantro, and thyme."
    }
  ];

  const boxes = [];
  for (const boxData of boxesData) {
    const box = await prisma.box.upsert({
      where: { number: boxData.number },
      update: boxData,
      create: boxData,
    });
    boxes.push(box);
    console.log(`✅ Box #${box.number}: ${box.name}`);
  }

  // Step 4: Add translations for Sinhala and Chinese
  console.log('\n🌍 Adding translations...');
  
  const translations = [
    // Box 1 - Tomatoes
    { boxNumber: 1, lang: 'si', name: 'තක්කාලි', description: 'පොහොසත් පෝෂක සහිත කෘෂි මෙන්ම පිරිසිදු තක්කාලි.' },
    { boxNumber: 1, lang: 'zh', name: '番茄', description: '天然有机番茄，营养丰富，富含抗氧化剂。' },
    
    // Box 2 - Bell Peppers
    { boxNumber: 2, lang: 'si', name: 'ගම්මිරිස්', description: 'රතු, කහ සහ කොළ වර්ණවල ගම්මිරිස් වර්ග.' },
    { boxNumber: 2, lang: 'zh', name: '甜椒', description: '多彩甜椒，有红、黄、绿等不同颜色品种。' },
    
    // Box 3 - Lettuce
    { boxNumber: 3, lang: 'si', name: 'ලෙටුස්', description: 'සැලඩ් සහ සැන්ඩ්විච් සඳහා සුදුසු තරුණ ලෙටුස්.' },
    { boxNumber: 3, lang: 'zh', name: '生菜', description: '脆嫩新鲜的生菜，非常适合制作沙拉和三明治。' },
    
    // Box 4 - Carrots
    { boxNumber: 4, lang: 'si', name: 'කැරට්', description: 'බීටා-කැරොටීන් සහ විටමින් සහිත මිහිරි කැරට්.' },
    { boxNumber: 4, lang: 'zh', name: '胡萝卜', description: '香甜脆嫩的胡萝卜，富含β-胡萝卜素和维生素。' },
    
    // Box 5 - Cucumbers
    { boxNumber: 5, lang: 'si', name: 'පිපිංගු', description: 'ගිම්හාන සැලඩ් සඳහා සුදුසු සිසිල් පිපිංගු.' },
    { boxNumber: 5, lang: 'zh', name: '黄瓜', description: '清爽的黄瓜，非常适合制作夏季沙拉。' },
    
    // Box 6 - Spinach
    { boxNumber: 6, lang: 'si', name: 'නිවිති', description: 'යකඩ සහ ෆොලේට් සහිත පෝෂණ සහිත නිවිති.' },
    { boxNumber: 6, lang: 'zh', name: '菠菜', description: '营养丰富的菠菜，富含铁和叶酸。' },
    
    // Box 7 - Basil
    { boxNumber: 7, lang: 'si', name: 'මදුරු', description: 'ඉතාලි ආහාර සහ පෙස්ටෝ සඳහා සුදුසු සුවඳ විලවුන් මදුරු.' },
    { boxNumber: 7, lang: 'zh', name: '罗勒', description: '芳香罗勒，非常适合制作意大利菜和香蒜酱。' },
    
    // Box 8 - Mint
    { boxNumber: 8, lang: 'si', name: 'පුදින', description: 'තේ සහ සිසිල් පාන සඳහා සුදුසු නැවුම් පුදින කොළ.' },
    { boxNumber: 8, lang: 'zh', name: '薄荷', description: '新鲜薄荷叶，非常适合泡茶和制作清爽饮品。' },
    
    // Box 9 - Chili Peppers
    { boxNumber: 9, lang: 'si', name: 'මිරිස්', description: 'ඔබේ ප්‍රියතම කෑමට රස එකතු කිරීම සඳහා කැරි මිරිස්.' },
    { boxNumber: 9, lang: 'zh', name: '辣椒', description: '辛辣的辣椒，为您的菜肴增添热度。' },
    
    // Box 10 - Eggplant
    { boxNumber: 10, lang: 'si', name: 'වම්බටු', description: 'පුළුස්සා, පුළුස්සා හෝ කලවම් කිරීම සඳහා සුදුසු බහුකාර්ය වම්බටු.' },
    { boxNumber: 10, lang: 'zh', name: '茄子', description: '多用途茄子，非常适合烧烤、烘烤或炒菜。' },
    
    // Box 11 - Zucchini
    { boxNumber: 11, lang: 'si', name: 'සූකිනි', description: 'පුළුස්සා, පුළුස්සා හෝ නූඩ්ල්ස් සෑදීම සඳහා නැවුම් සූකිනි.' },
    { boxNumber: 11, lang: 'zh', name: '西葫芦', description: '新鲜西葫芦，适合烘烤、烧烤或制作面条。' },
    
    // Box 12 - Herbs Mix
    { boxNumber: 12, lang: 'si', name: 'ඖෂධ මිශ්‍රණය', description: 'පාස්ලි, කොත්තමල්ලි සහ තයිම් ඇතුළු විවිධ නැවුම් ඖෂධ.' },
    { boxNumber: 12, lang: 'zh', name: '混合香草', description: '各种新鲜香草，包括欧芹、香菜和百里香。' },
  ];

  for (const trans of translations) {
    const box = boxes.find(b => b.number === trans.boxNumber);
    const language = languages[trans.lang];
    
    await prisma.boxTranslation.upsert({
      where: {
        boxId_languageId: {
          boxId: box.id,
          languageId: language.id
        }
      },
      update: {
        name: trans.name,
        description: trans.description
      },
      create: {
        boxId: box.id,
        languageId: language.id,
        name: trans.name,
        description: trans.description
      }
    });
    console.log(`✅ Translation: Box #${trans.boxNumber} → ${language.name}`);
  }

  // Step 5: Create sample sessions and views
  console.log('\n📊 Creating sample sessions and views...');
  
  const sessionLanguages = ['si', 'en', 'si', 'zh'];
  const sessions = [];
  
  for (let i = 0; i < 4; i++) {
    const session = await prisma.session.create({
      data: {
        sessionKey: uuidv4(),
        ipAddress: `192.168.1.${100 + i}`,
        language: sessionLanguages[i]
      }
    });
    sessions.push(session);
    console.log(`✅ Session ${i + 1}: ${session.language}`);
  }

  // Create views
  const viewsData = [
    { sessionIdx: 0, boxNumber: 1 }, // Session 1 - Sinhala
    { sessionIdx: 0, boxNumber: 2 },
    { sessionIdx: 0, boxNumber: 4 },
    { sessionIdx: 1, boxNumber: 1 }, // Session 2 - English
    { sessionIdx: 1, boxNumber: 3 },
    { sessionIdx: 2, boxNumber: 2 }, // Session 3 - Sinhala
    { sessionIdx: 2, boxNumber: 5 },
    { sessionIdx: 2, boxNumber: 7 },
    { sessionIdx: 3, boxNumber: 1 }, // Session 4 - Chinese
    { sessionIdx: 3, boxNumber: 2 },
  ];

  for (const viewData of viewsData) {
    const session = sessions[viewData.sessionIdx];
    const box = boxes.find(b => b.number === viewData.boxNumber);
    
    await prisma.view.create({
      data: {
        sessionId: session.id,
        boxId: box.id,
        language: session.language
      }
    });
  }
  console.log(`✅ Created ${viewsData.length} views`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Languages: ${Object.keys(languages).length}`);
  console.log(`   - Boxes: ${boxes.length}`);
  console.log(`   - Translations: ${translations.length}`);
  console.log(`   - Sessions: ${sessions.length}`);
  console.log(`   - Views: ${viewsData.length}`);
  console.log(`   - Admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
