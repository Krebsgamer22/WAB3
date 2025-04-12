import { NextResponse, type NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { athleteId, discipline, value, date, force } = await request.json()

    // Validate required fields
    if (!athleteId || !discipline || !value || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for existing performance
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingPerformance = await prisma.performance.findFirst({
      where: {
        athleteId,
        discipline,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    if (existingPerformance && !force) {
      return NextResponse.json(
        { 
          error: 'Duplicate entry',
          message: `Performance for ${discipline} on this date already exists`,
          existingId: existingPerformance.id
        },
        { status: 400 }
      )
    }

    // Age validation
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      select: { birthdate: true }
    })

    const criteria = await prisma.medalCriteria.findUnique({
      where: { discipline }
    })

    if (athlete && criteria) {
      const age = calculateAge(new Date(athlete.birthdate), new Date(date))
      
      if (age < criteria.minAge || age > criteria.maxAge) {
        return NextResponse.json(
          { 
            error: 'Age restriction',
            message: `${discipline} not available for ${age}-year-old athletes`,
            minAge: criteria.minAge,
            maxAge: criteria.maxAge
          },
          { status: 400 }
        )
      }
    }

    // Create new performance
    const newPerformance = await prisma.performance.create({
      data: {
        athleteId,
        discipline,
        value, 
        date: new Date(date),
      }
    })

    return NextResponse.json(newPerformance, { status: 201 })

  } catch (error) {
    console.error('Performance creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateAge(birthdate: Date, performanceDate: Date): number {
  const diff = performanceDate.getFullYear() - birthdate.getFullYear()
  const monthDiff = performanceDate.getMonth() - birthdate.getMonth()
  return monthDiff < 0 || (monthDiff === 0 && performanceDate.getDate() < birthdate.getDate()) 
    ? diff - 1 
    : diff
}
