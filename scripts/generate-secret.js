#!/usr/bin/env node

/**
 * Script para generar un secret seguro para NEXTAUTH_SECRET
 * Uso: node scripts/generate-secret.js
 */

const crypto = require('crypto');

function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

console.log('\n🔐 Generando NEXTAUTH_SECRET seguro...\n');
console.log('Copia este valor y úsalo en tu configuración:\n');
console.log('━'.repeat(60));
console.log(generateSecret());
console.log('━'.repeat(60));
console.log('\n📝 Dónde usar este secret:\n');
console.log('  Local:      Archivo .env.local');
console.log('  Producción: Vercel Dashboard → Environment Variables\n');
console.log('⚠️  IMPORTANTE: Usa secrets DIFERENTES para local y producción\n');

// Made with Bob
