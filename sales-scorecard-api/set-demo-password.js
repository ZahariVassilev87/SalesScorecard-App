const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setDemoPassword() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    // Update the demo user with a password
    const updatedUser = await prisma.user.update({
      where: { email: 'demo@instorm.bg' },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
      }
    });
    
    console.log('✅ Demo user password set successfully!');
    console.log('User:', updatedUser);
    console.log('Password: demo123');
    
  } catch (error) {
    console.error('❌ Error setting demo password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setDemoPassword();
