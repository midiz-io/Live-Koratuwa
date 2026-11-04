const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  const email = 'admin@livekaratuwa.local';
  const newPassword = 'password123';

  try {
    console.log(`🔄 Resetting password for ${email}...`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update directly via SQL to avoid Prisma schema mismatch with legacy table columns
    const result = await prisma.$executeRaw`
      UPDATE admins
      SET password = ${hashedPassword}
      WHERE email = ${email}
    `;

    if (result === 0) {
      console.error(`❌ Admin user with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`✅ Password reset successfully for: ${email}`);
    console.log(`🔐 New password: ${newPassword}`);
  } catch (error) {
    console.error(`❌ Error resetting password:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
