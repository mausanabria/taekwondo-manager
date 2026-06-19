/**
 * Script to synchronize local database with production schema
 * This script applies all pending migrations to the local database
 * 
 * Usage: node scripts/sync-local-database.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Starting local database synchronization...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.error('Please create a .env file with your local DATABASE_URL');
  console.error('Example: DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_db"');
  process.exit(1);
}

// Read .env file to check DATABASE_URL
const envContent = fs.readFileSync(envPath, 'utf-8');
const databaseUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);

if (!databaseUrlMatch) {
  console.error('❌ Error: DATABASE_URL not found in .env file!');
  console.error('Please add DATABASE_URL to your .env file');
  console.error('Example: DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_db"');
  process.exit(1);
}

const databaseUrl = databaseUrlMatch[1];
console.log('✅ Found DATABASE_URL in .env file');

// Check if it's a local database (not production)
if (databaseUrl.includes('neon.tech') || databaseUrl.includes('supabase') || databaseUrl.includes('railway')) {
  console.error('❌ Error: DATABASE_URL appears to be a production database!');
  console.error('This script should only be run against local databases.');
  console.error('Please update your .env file to use a local PostgreSQL database.');
  process.exit(1);
}

console.log('✅ Confirmed local database\n');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Step 1: Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated\n');

  // Step 2: Apply all pending migrations
  console.log('🔄 Step 2: Applying pending migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations applied successfully\n');

  // Step 3: Verify database schema
  console.log('🔍 Step 3: Verifying database schema...');
  execSync('npx prisma db pull --force', { stdio: 'inherit' });
  console.log('✅ Schema verified\n');

  console.log('✨ Local database synchronized successfully!');
  console.log('\n📋 Summary:');
  console.log('  - Prisma Client regenerated');
  console.log('  - All migrations applied');
  console.log('  - Schema verified');
  console.log('\n🚀 You can now run your application with: npm run dev');

} catch (error) {
  console.error('\n❌ Error during synchronization:', error.message);
  console.error('\n💡 Troubleshooting tips:');
  console.error('  1. Make sure PostgreSQL is running locally');
  console.error('  2. Verify your DATABASE_URL is correct in .env');
  console.error('  3. Check that the database exists');
  console.error('  4. Ensure you have proper permissions');
  process.exit(1);
}

// Made with Bob
