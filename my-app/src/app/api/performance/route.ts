import { NextResponse, type NextRequest } from 'next/server'
import { Prisma, PrismaClient, Discipline } from '@prisma/client'
import Papa from 'papaparse'

// Medal calculation logic
function calculateMedal(score: number): string {
  if (score > 100 || score < 0) {
    throw new Error('Invalid score - must be between 0-100')
  }
  if (score >= 90) return 'Gold'
  if (score >= 75) return 'Silver'
  if (score >= 60) return 'Bronze'
  throw new Error('Score below minimum threshold of 60')
}

const prisma = new PrismaClient()

interface CSVRow {
  firstName: string
  lastName: string
  birthdate: string
  discipline: string
  value: string
  date: string
}

interface ErrorReportRow extends CSVRow {
  error: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const athleteId = searchParams.get('athleteId')
    const discipline = searchParams.get('discipline')
    const year = searchParams.get('year')

    const prisma = new PrismaClient()
    
    const performances = await prisma.performance.findMany({
      where: {
        athleteId: athleteId ? parseInt(athleteId) : undefined,
        discipline: discipline as Discipline || undefined,
        date: year ? {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        } : undefined
      },
      include: {
        athlete: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(performances.map(perf => ({
      ...perf,
      value: perf.value.toNumber(),
      athleteName: `${perf.athlete.firstName} ${perf.athlete.lastName}`
    })), { status: 200 })
    
  } catch (error) {
    console.error('Performance fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const force = formData.get('force') === 'true'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const { data: csvRows, errors: parseErrors } = Papa.parse<CSVRow>(text, {
      header: true,
      skipEmptyLines: true
    })

    if (parseErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format', details: parseErrors },
        { status: 400 }
      )
    }

    const errorReport: ErrorReportRow[] = []
    const validRows = []

    // Process each CSV row
    for (const row of csvRows) {
      // Find matching athlete
      const athlete = await prisma.athlete.findFirst({
        where: {
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          birthdate: new Date(row.birthdate)
        }
      })

      if (!athlete) {
        errorReport.push({
          ...row,
          error: `Athlete not found: ${row.firstName} ${row.lastName} ${row.birthdate}`
        })
        continue
      }

      // Add to valid rows for processing
      validRows.push({
        athleteId: athlete.id,
        discipline: row.discipline,
      value: parseFloat(row.value.replace(',', '.').trim()),
        date: new Date(row.date),
        force
      })
    }

    // Batch create valid performances with error handling
    const results = await Promise.all(
      validRows.map(async row => {
        // Validate discipline
        if (!Object.values(Discipline).includes(row.discipline as Discipline)) {
          return { error: new Error(`Invalid discipline: ${row.discipline}`) }
        }
        
        try {
          return await prisma.performance.upsert({
            where: {
              athleteId_discipline_date: {
                athleteId: row.athleteId,
                discipline: row.discipline as Discipline,
                date: row.date
              }
            },
            create: {
              athleteId: row.athleteId,
              discipline: row.discipline as Discipline,
              value: row.value,
              date: row.date
            },
            update: row.force ? {
              value: new Prisma.Decimal(row.value)
            } as any : undefined // Type assertion for Prisma update payload
          })
        } catch (error) {
          return { error }
        }
      })
    )

    // Process results and errors
    const createdPerformances = []
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result instanceof Error) {
        errorReport.push({
          ...csvRows[i],
          error: result.message
        })
      } else if ('error' in result) {
        errorReport.push({
          ...csvRows[i],
          error: result.error instanceof Error ? result.error.message : 'Database operation failed'
        })
      } else {
        createdPerformances.push(result)
      }
    }

    // Generate error report CSV
    const errorCsv = Papa.unparse({
      fields: ['firstName', 'lastName', 'birthdate', 'discipline', 'value', 'date', 'error'],
      data: errorReport
    })

    // Calculate medals for valid performances
    const performancesWithMedals = createdPerformances.map(perf => {
      try {
        return {
          ...perf,
          value: perf.value.toNumber(),
          medal: calculateMedal(perf.value.toNumber())
        }
      } catch (error) {
        return {
          ...perf,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    return NextResponse.json({
      successCount: createdPerformances.length,
      errorCount: errorReport.length,
      errorReport: errorCsv,
      performances: performancesWithMedals
    }, { status: 200 })

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
