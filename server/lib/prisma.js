// Singleton Prisma Client for serverless environments
const { PrismaClient } = require('@prisma/client');

let prisma;

const initializePrisma = () => {
  if (prisma) return prisma;

  try {
    console.log('🔄 Initializing Prisma Client...');
    
    const prismaOptions = {
      log: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['query', 'error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    };

    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient(prismaOptions);
      console.log('✅ Prisma Client initialized (production mode)');
    } else {
      // In development, use a global variable to prevent multiple instances
      if (!global.prisma) {
        global.prisma = new PrismaClient(prismaOptions);
        console.log('✅ Prisma Client initialized (development mode)');
      }
      prisma = global.prisma;
    }
    
    return prisma;
  } catch (error) {
    console.error('❌ Failed to initialize Prisma Client:', error);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
    throw new Error(`Prisma initialization failed: ${error.message}`);
  }
};

// Initialize immediately
prisma = initializePrisma();

module.exports = prisma;
