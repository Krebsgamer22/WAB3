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
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthdate: true,
        gender: true
      }
    });

    // Create CSV content
    const csvHeader = 'ID,First Name,Last Name,Email,Birthdate,Gender\n';
    const csvRows = athletes.map((athlete) => 
      `${athlete.id},${athlete.firstName},${athlete.lastName},${athlete.email},"${new Date(athlete.birthdate).toLocaleDateString()}",${athlete.gender}`
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
