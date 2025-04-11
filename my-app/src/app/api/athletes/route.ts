import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function for error responses
function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, birthdate, gender } = await request.json();
    
    // Check for existing email
    const existingAthlete = await prisma.athlete.findUnique({
      where: { email }
    });
    
    if (existingAthlete) {
      return errorResponse('Email already exists', 400);
    }

    const athlete = await prisma.athlete.create({
      data: { 
        firstName,
        lastName,
        email,
        birthdate: new Date(birthdate),
        gender 
      }
    });
    
    return NextResponse.json(athlete);
  } catch (error) {
    return errorResponse('Failed to create athlete', 500);
  }
}

export async function GET() {
  try {
    const athletes = await prisma.athlete.findMany();
    return NextResponse.json(athletes);
  } catch (error) {
    return errorResponse('Failed to fetch athletes', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (updateData.email) {
      const existingAthlete = await prisma.athlete.findUnique({
        where: { email: updateData.email }
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
