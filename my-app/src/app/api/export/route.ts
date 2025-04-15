import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Parser } from 'json2csv';

interface CSVData {
  Name: string;
  Vorname: string;
  Geschlecht: string;
  Geburtsjahr: number;
  Übung: string;
  Kategorie: string;
  Datum: string;
  Ergebnis: number;
  Punkte: number;
}

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    const athleteIds = Array.isArray(ids) ? ids : [ids];
    
    // Validate athletes exist
    const athletes = await prisma.athlete.findMany({
      where: { id: { in: athleteIds } },
      include: {
        performances: {
          include: { criteria: true }
        }
      }
    });

    if (athletes.length !== athleteIds.length) {
      const missingIds = athleteIds.filter((id: number) => 
        !athletes.some((a: { id: number }) => a.id === id)
      );
      return NextResponse.json(
        { error: `Athletes not found: ${missingIds.join(', ')}` },
        { status: 404 }
      );
    }

    // Prepare CSV data
    const csvData: CSVData[] = [];
    const fields = [
      'Name', 'Vorname', 'Geschlecht', 'Geburtsjahr',
      'Übung', 'Kategorie', 'Datum', 'Ergebnis', 'Punkte'
    ];

    for (const athlete of athletes) {
      for (const performance of athlete.performances) {
        csvData.push({
          Name: athlete.lastName,
          Vorname: athlete.firstName,
          Geschlecht: athlete.gender,
          Geburtsjahr: athlete.birthdate.getFullYear(),
          Übung: performance.discipline,
          Kategorie: `${performance.criteria.minAge}-${performance.criteria.maxAge} Jahre`,
          Datum: performance.date.toISOString().split('T')[0],
          Ergebnis: Number(performance.value),
          Punkte: Number(performance.value)
        });
      }
    }

    // Generate CSV
    const parser = new Parser({ fields, delimiter: ';' });
    const csv = parser.parse(csvData);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${athleteIds.length > 1 ? 'bulk-export' : 'single-export'}-${Date.now()}.csv`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
