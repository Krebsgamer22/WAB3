import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    if (!ids?.length) {
      return NextResponse.json(
        { error: "No athlete IDs provided" },
        { status: 400 }
      )
    }

    const athletes = await prisma.athlete.findMany({
      where: { id: { in: ids.map((id: string) => parseInt(id)) } },
      select: {
        firstName: true,
        lastName: true,
        birthdate: true,
        gender: true,
        email: true
      }
    });

    // Create CSV content matching import format
    const csvHeader = 'firstName,lastName,birthdate,gender,email\n';
    const csvRows = athletes.map((athlete) => 
      `${athlete.firstName},${athlete.lastName},${new Date(athlete.birthdate).toISOString().split('T')[0]},${athlete.gender},${athlete.email}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=athletes-export-${Date.now()}.csv`
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 400 }
    );
  }
}
