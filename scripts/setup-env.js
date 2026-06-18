#!/usr/bin/env node

/**
 * Script para ayudar a configurar las variables de entorno
 * Uso: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

function createEnvLocal() {
  console.log('🔧 Configurando variables de entorno locales...\n');

  // Check if .env.local already exists
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    console.log('⚠️  El archivo .env.local ya existe.');
    console.log('   Si quieres recrearlo, elimínalo primero.\n');
    return;
  }

  // Read .env.example
  if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    console.error('❌ No se encontró .env.example');
    process.exit(1);
  }

  const exampleContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
  
  // Generate a secure secret
  const secret = generateSecret();
  
  // Replace the placeholder secret with a real one
  const localContent = exampleContent.replace(
    'your-secret-key-here-generate-with-openssl-rand-base64-32',
    secret
  );

  // Write .env.local
  fs.writeFileSync(ENV_LOCAL_PATH, localContent);

  console.log('✅ Archivo .env.local creado exitosamente!\n');
  console.log('📝 Configuración generada:');
  console.log('   - DATABASE_URL: postgresql://user:password@localhost:5432/taekwondo_db');
  console.log('   - NEXTAUTH_URL: http://localhost:3000');
  console.log('   - NEXTAUTH_SECRET: [generado automáticamente]');
  console.log('   - NODE_ENV: development\n');
  
  console.log('⚙️  Próximos pasos:');
  console.log('   1. Edita .env.local y actualiza DATABASE_URL con tus credenciales locales');
  console.log('   2. Ejecuta: npx prisma generate');
  console.log('   3. Ejecuta: npx prisma migrate dev');
  console.log('   4. Ejecuta: npm run dev\n');
  
  console.log('🚀 Para producción (Vercel):');
  console.log('   1. Genera otro secret: node scripts/generate-secret.js');
  console.log('   2. Configura las variables en Vercel Dashboard');
  console.log('   3. Lee DEPLOYMENT_GUIDE.md para más detalles\n');
}

// Run
createEnvLocal();

// Made with Bob
