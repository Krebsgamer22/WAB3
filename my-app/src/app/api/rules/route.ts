import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { url } = await request.json();
  
  try {
    // Validate HTTPS
    if (!url.startsWith('https://')) {
      return NextResponse.json({ error: 'Nur HTTPS-URLs erlaubt' }, { status: 400 });
    }

    // Validate allowed domains
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    const urlObj = new URL(url);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return NextResponse.json({ error: 'Domain nicht erlaubt' }, { status: 400 });
    }

    // Fetch and validate rules
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Ungültige Regelungen' }, { status: 400 });
    }

    const rules = await response.text();
    
    // TODO: Add actual rules processing here
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Rules update error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
