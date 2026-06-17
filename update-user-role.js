const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: { email: 'juan.perez@taekwondo.com' },
      data: { role: 'ADMIN' }
    });
    
    console.log('✅ Usuario actualizado a ADMIN:', user.email, '- Role:', user.role);
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();

// Made with Bob
