import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.payment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.studentSchedule.deleteMany();
  await prisma.monthlyFee.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.student.deleteMany();
  await prisma.school.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create Users (Teachers)
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const teacher1 = await prisma.user.create({
    data: {
      name: 'Maestro Juan Pérez',
      email: 'juan.perez@taekwondo.com',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Maestra María González',
      email: 'maria.gonzalez@taekwondo.com',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Created ${2} users`);

  // Create Schools
  console.log('🏫 Creating schools...');
  const school1 = await prisma.school.create({
    data: {
      name: 'Escuela de Taekwondo Dragón Dorado',
      address: 'Av. Libertador 1234, Buenos Aires',
      phone: '+54 11 4567-8900',
      description: 'Escuela de taekwondo tradicional con más de 20 años de experiencia. Clases para todas las edades.',
      ownerId: teacher1.id,
    },
  });

  const school2 = await prisma.school.create({
    data: {
      name: 'Academia Tigre Blanco',
      address: 'Calle Corrientes 5678, Buenos Aires',
      phone: '+54 11 4567-8901',
      description: 'Academia especializada en competencias y formación de campeones.',
      ownerId: teacher2.id,
    },
  });

  console.log(`✅ Created ${2} schools`);

  // Create Schedules for School 1
  console.log('📅 Creating schedules...');
  const schedules = await Promise.all([
    // Lunes y Miércoles - Niños (17:00-18:00)
    prisma.schedule.create({
      data: {
        name: 'Niños Principiantes',
        dayOfWeek: 1, // Lunes
        startTime: '17:00',
        endTime: '18:00',
        capacity: 20,
        schoolId: school1.id,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Niños Principiantes',
        dayOfWeek: 3, // Miércoles
        startTime: '17:00',
        endTime: '18:00',
        capacity: 20,
        schoolId: school1.id,
      },
    }),
    // Martes y Jueves - Adultos (19:00-20:30)
    prisma.schedule.create({
      data: {
        name: 'Adultos Avanzados',
        dayOfWeek: 2, // Martes
        startTime: '19:00',
        endTime: '20:30',
        capacity: 15,
        schoolId: school1.id,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Adultos Avanzados',
        dayOfWeek: 4, // Jueves
        startTime: '19:00',
        endTime: '20:30',
        capacity: 15,
        schoolId: school1.id,
      },
    }),
    // Viernes - Competencia (18:00-20:00)
    prisma.schedule.create({
      data: {
        name: 'Entrenamiento de Competencia',
        dayOfWeek: 5, // Viernes
        startTime: '18:00',
        endTime: '20:00',
        capacity: 12,
        schoolId: school1.id,
      },
    }),
  ]);

  console.log(`✅ Created ${schedules.length} schedules`);

  // Create Students
  console.log('👨‍🎓 Creating students...');
  const students = await Promise.all([
    prisma.student.create({
      data: {
        firstName: 'Lucas',
        lastName: 'Martínez',
        email: 'lucas.martinez@email.com',
        phone: '+54 11 1234-5678',
        birthDate: new Date('2010-03-15'),
        belt: 'Amarillo',
        address: 'Calle Falsa 123, Buenos Aires',
        emergencyContact: 'Ana Martínez (Madre)',
        emergencyPhone: '+54 11 1234-5679',
        notes: 'Muy dedicado, muestra gran progreso',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Sofía',
        lastName: 'Rodríguez',
        email: 'sofia.rodriguez@email.com',
        phone: '+54 11 2345-6789',
        birthDate: new Date('2012-07-22'),
        belt: 'Naranja',
        address: 'Av. Siempre Viva 456, Buenos Aires',
        emergencyContact: 'Carlos Rodríguez (Padre)',
        emergencyPhone: '+54 11 2345-6790',
        notes: 'Excelente técnica de patadas',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Mateo',
        lastName: 'Fernández',
        email: 'mateo.fernandez@email.com',
        phone: '+54 11 3456-7890',
        birthDate: new Date('2008-11-30'),
        belt: 'Verde',
        address: 'Calle del Sol 789, Buenos Aires',
        emergencyContact: 'Laura Fernández (Madre)',
        emergencyPhone: '+54 11 3456-7891',
        notes: 'Participó en 2 competencias regionales',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Valentina',
        lastName: 'López',
        email: 'valentina.lopez@email.com',
        phone: '+54 11 4567-8901',
        birthDate: new Date('2011-05-18'),
        belt: 'Azul',
        address: 'Av. Libertad 321, Buenos Aires',
        emergencyContact: 'Miguel López (Padre)',
        emergencyPhone: '+54 11 4567-8902',
        notes: 'Líder natural, ayuda a compañeros',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Benjamín',
        lastName: 'García',
        email: 'benjamin.garcia@email.com',
        phone: '+54 11 5678-9012',
        birthDate: new Date('2009-09-25'),
        belt: 'Rojo',
        address: 'Calle Principal 654, Buenos Aires',
        emergencyContact: 'Patricia García (Madre)',
        emergencyPhone: '+54 11 5678-9013',
        notes: 'Próximo a rendir cinturón negro',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Emma',
        lastName: 'Sánchez',
        email: 'emma.sanchez@email.com',
        phone: '+54 11 6789-0123',
        birthDate: new Date('2013-01-10'),
        belt: 'Blanco',
        address: 'Av. Central 987, Buenos Aires',
        emergencyContact: 'Roberto Sánchez (Padre)',
        emergencyPhone: '+54 11 6789-0124',
        notes: 'Recién comenzó, muy entusiasta',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Thiago',
        lastName: 'Romero',
        email: 'thiago.romero@email.com',
        phone: '+54 11 7890-1234',
        birthDate: new Date('2010-12-05'),
        belt: 'Amarillo',
        address: 'Calle Nueva 147, Buenos Aires',
        emergencyContact: 'Claudia Romero (Madre)',
        emergencyPhone: '+54 11 7890-1235',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Martina',
        lastName: 'Díaz',
        email: 'martina.diaz@email.com',
        phone: '+54 11 8901-2345',
        birthDate: new Date('2011-08-14'),
        belt: 'Verde',
        address: 'Av. del Parque 258, Buenos Aires',
        emergencyContact: 'Fernando Díaz (Padre)',
        emergencyPhone: '+54 11 8901-2346',
        notes: 'Buena flexibilidad',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Santiago',
        lastName: 'Torres',
        email: 'santiago.torres@email.com',
        phone: '+54 11 9012-3456',
        birthDate: new Date('2009-04-20'),
        belt: 'Azul',
        address: 'Calle Larga 369, Buenos Aires',
        emergencyContact: 'Mónica Torres (Madre)',
        emergencyPhone: '+54 11 9012-3457',
        notes: 'Excelente disciplina',
        schoolId: school1.id,
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Isabella',
        lastName: 'Morales',
        email: 'isabella.morales@email.com',
        phone: '+54 11 0123-4567',
        birthDate: new Date('2012-06-08'),
        belt: 'Naranja',
        address: 'Av. Grande 741, Buenos Aires',
        emergencyContact: 'Jorge Morales (Padre)',
        emergencyPhone: '+54 11 0123-4568',
        schoolId: school1.id,
      },
    }),
  ]);

  console.log(`✅ Created ${students.length} students`);

  // Enroll students in schedules
  console.log('📝 Enrolling students in schedules...');
  const enrollments = [];

  // Niños (primeros 6 estudiantes) en clases de Lunes y Miércoles
  for (let i = 0; i < 6; i++) {
    enrollments.push(
      prisma.studentSchedule.create({
        data: {
          studentId: students[i].id,
          scheduleId: schedules[0].id, // Lunes
        },
      }),
      prisma.studentSchedule.create({
        data: {
          studentId: students[i].id,
          scheduleId: schedules[1].id, // Miércoles
        },
      })
    );
  }

  // Estudiantes avanzados (últimos 4) en clases de Martes, Jueves y Viernes
  for (let i = 6; i < 10; i++) {
    enrollments.push(
      prisma.studentSchedule.create({
        data: {
          studentId: students[i].id,
          scheduleId: schedules[2].id, // Martes
        },
      }),
      prisma.studentSchedule.create({
        data: {
          studentId: students[i].id,
          scheduleId: schedules[3].id, // Jueves
        },
      }),
      prisma.studentSchedule.create({
        data: {
          studentId: students[i].id,
          scheduleId: schedules[4].id, // Viernes
        },
      })
    );
  }

  await Promise.all(enrollments);
  console.log(`✅ Created ${enrollments.length} enrollments`);

  // Create Monthly Fees
  console.log('💰 Creating monthly fees...');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const monthlyFees = [];
  
  // Crear cuotas para los últimos 3 meses y el mes actual
  for (let i = 3; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    monthlyFees.push(
      await prisma.monthlyFee.create({
        data: {
          amount: 15000, // $15,000 ARS
          month,
          year,
          description: `Cuota mensual ${month}/${year}`,
          schoolId: school1.id,
        },
      })
    );
  }

  console.log(`✅ Created ${monthlyFees.length} monthly fees`);

  // Create Attendance Records
  console.log('✅ Creating attendance records...');
  const attendances = [];

  // Función helper para obtener fechas de un mes específico
  function getDatesForMonth(year: number, month: number, dayOfWeek: number): Date[] {
    const dates: Date[] = [];
    const date = new Date(year, month - 1, 1);
    
    // Encontrar el primer día de la semana especificado
    while (date.getDay() !== dayOfWeek) {
      date.setDate(date.getDate() + 1);
    }
    
    // Agregar todas las fechas de ese día de la semana en el mes
    while (date.getMonth() === month - 1) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }
    
    return dates;
  }

  // Crear asistencias para los últimos 3 meses
  for (let monthOffset = 3; monthOffset >= 1; monthOffset--) {
    const date = new Date(currentYear, currentMonth - 1 - monthOffset, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Asistencias para niños (Lunes y Miércoles)
    const mondayDates = getDatesForMonth(year, month, 1);
    const wednesdayDates = getDatesForMonth(year, month, 3);

    for (let i = 0; i < 6; i++) {
      // Lunes
      for (const attendanceDate of mondayDates) {
        // 90% de asistencia
        if (Math.random() > 0.1) {
          attendances.push(
            prisma.attendance.create({
              data: {
                date: attendanceDate,
                wasPresent: true,
                studentId: students[i].id,
                scheduleId: schedules[0].id,
              },
            })
          );
        }
      }

      // Miércoles
      for (const attendanceDate of wednesdayDates) {
        if (Math.random() > 0.1) {
          attendances.push(
            prisma.attendance.create({
              data: {
                date: attendanceDate,
                wasPresent: true,
                studentId: students[i].id,
                scheduleId: schedules[1].id,
              },
            })
          );
        }
      }
    }

    // Asistencias para avanzados (Martes, Jueves, Viernes)
    const tuesdayDates = getDatesForMonth(year, month, 2);
    const thursdayDates = getDatesForMonth(year, month, 4);
    const fridayDates = getDatesForMonth(year, month, 5);

    for (let i = 6; i < 10; i++) {
      // Martes
      for (const attendanceDate of tuesdayDates) {
        if (Math.random() > 0.15) {
          attendances.push(
            prisma.attendance.create({
              data: {
                date: attendanceDate,
                wasPresent: true,
                studentId: students[i].id,
                scheduleId: schedules[2].id,
              },
            })
          );
        }
      }

      // Jueves
      for (const attendanceDate of thursdayDates) {
        if (Math.random() > 0.15) {
          attendances.push(
            prisma.attendance.create({
              data: {
                date: attendanceDate,
                wasPresent: true,
                studentId: students[i].id,
                scheduleId: schedules[3].id,
              },
            })
          );
        }
      }

      // Viernes
      for (const attendanceDate of fridayDates) {
        if (Math.random() > 0.2) {
          attendances.push(
            prisma.attendance.create({
              data: {
                date: attendanceDate,
                wasPresent: true,
                studentId: students[i].id,
                scheduleId: schedules[4].id,
              },
            })
          );
        }
      }
    }
  }

  await Promise.all(attendances);
  console.log(`✅ Created ${attendances.length} attendance records`);

  // Create Payments
  console.log('💳 Creating payments...');
  const payments = [];

  // Algunos estudiantes pagaron algunos meses
  // Estudiante 0: Pagó los últimos 2 meses
  for (let i = 2; i >= 1; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 15);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    payments.push(
      prisma.payment.create({
        data: {
          amount: 15000,
          month,
          year,
          paymentDate: date,
          paymentMethod: 'Efectivo',
          notes: 'Pago en tiempo y forma',
          studentId: students[0].id,
          schoolId: school1.id,
        },
      })
    );
  }

  // Estudiante 1: Pagó solo el último mes
  const lastMonthDate = new Date(currentYear, currentMonth - 1 - 1, 20);
  payments.push(
    prisma.payment.create({
      data: {
        amount: 15000,
        month: lastMonthDate.getMonth() + 1,
        year: lastMonthDate.getFullYear(),
        paymentDate: lastMonthDate,
        paymentMethod: 'Transferencia',
        studentId: students[1].id,
        schoolId: school1.id,
      },
    })
  );

  // Estudiante 2: No pagó ningún mes (tiene deuda)

  // Estudiante 3: Pagó todos los meses
  for (let i = 3; i >= 1; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 10);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    payments.push(
      prisma.payment.create({
        data: {
          amount: 15000,
          month,
          year,
          paymentDate: date,
          paymentMethod: 'Tarjeta de débito',
          studentId: students[3].id,
          schoolId: school1.id,
        },
      })
    );
  }

  // Estudiante 7: Pagó los últimos 2 meses
  for (let i = 2; i >= 1; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 18);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    payments.push(
      prisma.payment.create({
        data: {
          amount: 15000,
          month,
          year,
          paymentDate: date,
          paymentMethod: 'Efectivo',
          studentId: students[7].id,
          schoolId: school1.id,
        },
      })
    );
  }

  await Promise.all(payments);
  console.log(`✅ Created ${payments.length} payments`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${2}`);
  console.log(`   - Schools: ${2}`);
  console.log(`   - Schedules: ${schedules.length}`);
  console.log(`   - Students: ${students.length}`);
  console.log(`   - Enrollments: ${enrollments.length}`);
  console.log(`   - Monthly Fees: ${monthlyFees.length}`);
  console.log(`   - Attendance Records: ${attendances.length}`);
  console.log(`   - Payments: ${payments.length}`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Email: juan.perez@taekwondo.com');
  console.log('   Password: password123');
  console.log('\n   Email: maria.gonzalez@taekwondo.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Made with Bob
