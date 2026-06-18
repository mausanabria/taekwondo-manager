import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const schoolId = session.user.schoolId
    
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with user" },
        { status: 400 }
      )
    }

    // Obtener todos los alumnos activos con fecha de nacimiento
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        isActive: true,
        birthDate: {
          not: null
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        enrollments: {
          where: {
            isActive: true
          },
          select: {
            schedule: {
              select: {
                id: true,
                name: true,
                daysOfWeek: true,
                dayOfWeek: true
              }
            }
          }
        }
      }
    })

    // Calcular días hasta el cumpleaños y ordenar
    const today = new Date()
    const currentYear = today.getFullYear()
    
    const birthdaysWithInfo = students
      .map(student => {
        if (!student.birthDate) return null

        const birthDate = new Date(student.birthDate)
        const age = currentYear - birthDate.getFullYear()
        
        // Próximo cumpleaños este año
        let nextBirthday = new Date(
          currentYear,
          birthDate.getMonth(),
          birthDate.getDate()
        )
        
        // Si ya pasó este año, calcular para el próximo
        if (nextBirthday < today) {
          nextBirthday = new Date(
            currentYear + 1,
            birthDate.getMonth(),
            birthDate.getDate()
          )
        }
        
        // Calcular días faltantes
        const daysUntil = Math.ceil(
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        // Obtener día de la semana del cumpleaños (0 = Domingo, 1 = Lunes, etc.)
        const birthdayDayOfWeek = nextBirthday.getDay()
        
        // Verificar si coincide con alguna clase del alumno
        const hasClassOnBirthday = student.enrollments.some(enrollment => {
          const schedule = enrollment.schedule
          // Verificar si el día del cumpleaños está en los días de la clase
          return schedule.daysOfWeek.includes(birthdayDayOfWeek) ||
                 schedule.dayOfWeek === birthdayDayOfWeek
        })
        
        // Obtener nombres de las clases donde coincide
        const classesOnBirthday = student.enrollments
          .filter(enrollment => {
            const schedule = enrollment.schedule
            return schedule.daysOfWeek.includes(birthdayDayOfWeek) ||
                   schedule.dayOfWeek === birthdayDayOfWeek
          })
          .map(enrollment => enrollment.schedule.name)

        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          birthDate: birthDate.toISOString(),
          nextBirthday: nextBirthday.toISOString(),
          age: age,
          nextAge: age + (nextBirthday.getFullYear() > currentYear ? 1 : 0),
          daysUntil,
          hasClassOnBirthday,
          classesOnBirthday,
          birthdayDayOfWeek
        }
      })
      .filter(Boolean)
      .sort((a, b) => a!.daysUntil - b!.daysUntil)

    return NextResponse.json(birthdaysWithInfo)
  } catch (error) {
    console.error("Error fetching birthdays:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Made with Bob