import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate date format (TT.MM.JJJJ with actual date validation)
    // Validate required fields first
    if (!data.date || !data.athletes?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(data.date)) {
      return NextResponse.json(
        { error: "Invalid date format - use TT.MM.JJJJ" },
        { status: 400 }
      )
    }
    
    const [day, month, year] = data.date.split('.');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const dateObj = new Date(isoDate);
    
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Check for duplicate emails
interface AthleteData {
  email: string
}

    // Validate unique emails
    const emailCounts = new Map<string,number>();
    for (const athlete of data.athletes) {
      const count = emailCounts.get(athlete.email) || 0;
      emailCounts.set(athlete.email, count + 1);
    }
    
    const duplicates = Array.from(emailCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([email]) => email);

    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: `Duplicate emails found - must use unique emails: ${duplicates.join(', ')}` },
        { status: 400 }
      );
    }

    // If all validations pass
    return NextResponse.json(
      { message: "Export data validated successfully" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request format - must include valid date and athlete data with unique emails" },
      { status: 400 }
    );
  }
}
