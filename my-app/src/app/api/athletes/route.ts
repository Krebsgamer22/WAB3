import { NextResponse, type NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { parse } from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let athletes: Prisma.AthleteCreateInput[]

    if (contentType?.includes('text/csv')) {
      const csvData = await request.text()
      const result = parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => {
          const trimmed = header.trim().toLowerCase();
          const mappings: Record<string, string> = {
            'firstname': 'firstName',
            'lastname': 'lastName',
            'birth date': 'birthdate',
            'birth_date': 'birthdate',
            'date of birth': 'birthdate',
            'dob': 'birthdate',
            'sex': 'gender',
            'm/f': 'gender'
          };
          return mappings[trimmed] || trimmed;
        },
        transform: (value, field) => {
          if (field === 'birthdate') {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              throw new Error(`Invalid date format: ${value}. Use YYYY-MM-DD`)
            }
            return date
          }
          return value.toString().trim()
        }
      })

      if (result.errors.length > 0) {
        throw new Error('CSV parsing failed: ' + result.errors[0].message)
      }

      athletes = result.data as Prisma.AthleteCreateInput[]
    } else {
      athletes = [await request.json()]
    }

    const requiredFields = ['firstName', 'lastName', 'birthdate', 'gender', 'email']
    const validationErrors = []

    for (const [index, athlete] of athletes.entries()) {
      // Check required fields
      const missingFields = requiredFields.filter(field => !(field in athlete))
      if (missingFields.length > 0) {
        validationErrors.push({
          row: index + 1,
          error: `Missing required fields: ${missingFields.join(', ')}`
        })
        continue
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(athlete.email)) {
        validationErrors.push({
          row: index + 1,
          error: `Invalid email format: ${athlete.email}`
        })
      }

      // Validate gender values
      const validGenders = ['MALE', 'FEMALE', 'OTHER']
      if (!validGenders.includes(athlete.gender.toUpperCase())) {
        validationErrors.push({
          row: index + 1,
          error: `Invalid gender: ${athlete.gender}. Valid values are ${validGenders.join(', ')}`
        })
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "CSV validation failed",
          details: validationErrors 
        },
        { status: 400 }
      )
    }

    const createdAthletes = []
    for (const athlete of athletes) {
      try {
        const newAthlete = await prisma.athlete.create({
          data: {
            ...athlete,
            birthdate: new Date(athlete.birthdate)
          }
        })
        createdAthletes.push(newAthlete)
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return NextResponse.json(
            { 
              error: "Duplicate entry",
              details: `Email ${athlete.email} already exists in row ${createdAthletes.length + 1}`
            },
            { status: 409 }
          )
        }
        throw error
      }
    }

    return NextResponse.json(
      { count: createdAthletes.length, athletes: createdAthletes },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Import error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: "Duplicate email address detected" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { 
        error: "Import failed",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  const athletes = await prisma.athlete.findMany()
  return NextResponse.json(athletes)
}

export async function PUT(request: NextRequest) {
  try {
    const pathSegments = request.nextUrl.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1]
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Missing or invalid athlete ID" },
        { status: 400 }
      )
    }
    
    const updateData = await request.json()
    
    // Prevent updating protected fields
    delete updateData.id
    delete updateData.email
    
    const updatedAthlete = await prisma.athlete.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        birthdate: updateData.birthdate ? new Date(updateData.birthdate) : undefined
      }
    })
    
    return NextResponse.json(updatedAthlete)
    
  } catch (error) {
    console.error('Update athlete error:', error)
    return NextResponse.json(
      { error: "Failed to update athlete - invalid ID or data format" },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const pathSegments = request.nextUrl.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1]
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Missing or invalid athlete ID" },
        { status: 400 }
      )
    }
    
    // Check for existing performances
    const performances = await prisma.performance.findMany({
      where: { athleteId: parseInt(id) }
    })
    
    if (performances.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete athlete with existing performances" },
        { status: 409 }
      )
    }

    // Delete athlete
    await prisma.athlete.delete({
      where: { id: parseInt(id) }
    })
    
    return new Response(null, { status: 204 })
    
  } catch (error) {
    console.error('Delete athlete error:', error)
      return NextResponse.json(
        { error: "Athlete not found" },
        { status: 404 }
    )
  }
}
