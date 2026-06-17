/**
 * Script to populate initial FrequencyHistory records for existing StudentSchedule entries
 * This ensures historical data is preserved when implementing the frequency history system
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateFrequencyHistory() {
  console.log('🚀 Starting frequency history migration...\n');

  try {
    // Get all existing student schedules
    const enrollments = await prisma.studentSchedule.findMany({
      select: {
        id: true,
        weeklyFrequency: true,
        monthlyFee: true,
        enrolledAt: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        schedule: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`📊 Found ${enrollments.length} enrollments to migrate\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const enrollment of enrollments) {
      try {
        // Check if history already exists for this enrollment
        const existingHistory = await prisma.frequencyHistory.findFirst({
          where: {
            studentScheduleId: enrollment.id,
          },
        });

        if (existingHistory) {
          console.log(
            `⏭️  Skipping ${enrollment.student.firstName} ${enrollment.student.lastName} - ${enrollment.schedule.name} (history already exists)`
          );
          skipCount++;
          continue;
        }

        // Create initial frequency history record
        await prisma.frequencyHistory.create({
          data: {
            studentScheduleId: enrollment.id,
            weeklyFrequency: enrollment.weeklyFrequency,
            monthlyFee: enrollment.monthlyFee,
            effectiveFrom: enrollment.enrolledAt,
            effectiveTo: null, // Current/active
          },
        });

        console.log(
          `✅ Created history for ${enrollment.student.firstName} ${enrollment.student.lastName} - ${enrollment.schedule.name} (${enrollment.weeklyFrequency}x/week)`
        );
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error processing ${enrollment.student.firstName} ${enrollment.student.lastName}:`,
          error
        );
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${enrollments.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the logs above.');
    }
  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateFrequencyHistory()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

// Made with Bob
