import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function for error responses
function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { firstName, lastName, email, birthdate } = data;
    
    // Validate required fields
    if (!firstName || !lastName) {
      return errorResponse('First name and last name are required', 400);
    }
    
    // Check for existing email
    const existingAthlete = await prisma.athlete.findFirst({
      where: { email: email || undefined }
    });
    
    if (existingAthlete) {
      return errorResponse('Email already exists', 400);
    }

    const athlete = await prisma.athlete.create({
      data: { 
        firstName,
        lastName,
        email,
        ...(birthdate && { birthdate: new Date(birthdate) })
      }
    });
    
    return NextResponse.json(athlete);
  } catch (error) {
    return errorResponse('Failed to create athlete', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    const where = year ? {
      birthdate: {
        gte: new Date(parseInt(year), 0, 1), // Start of year
        lt: new Date(parseInt(year) + 1, 0, 1) // Start of next year
      }
    } : {};

    const athletes = await prisma.athlete.findMany({
      where
    });
    return NextResponse.json(athletes, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    return errorResponse('Failed to fetch athletes', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (updateData.email) {
      const existingAthlete = await prisma.athlete.findFirst({
        where: {
          email: updateData.email,
          NOT: { id }
        }
      });
      
      if (existingAthlete && existingAthlete.id !== id) {
        return errorResponse('Email already exists', 400);
      }
    }

    const updatedAthlete = await prisma.athlete.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(updatedAthlete);
  } catch (error) {
    return errorResponse('Failed to update athlete', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.athlete.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse('Failed to delete athlete', 500);
  }
}
