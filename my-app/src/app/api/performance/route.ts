import { NextResponse, type NextRequest } from 'next/server'
import { PrismaClient, Discipline } from '@prisma/client'
import Papa from 'papaparse'

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
        value: parseFloat(row.value),
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
              value: row.value
            } : undefined
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
          error: result.error.message
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

    return NextResponse.json({
      successCount: createdPerformances.length,
      errorCount: errorReport.length,
      errorReport: errorCsv
    }, { status: 201 })

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
