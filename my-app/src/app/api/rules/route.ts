import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rules = await prisma.rule.findMany({
      orderBy: { effectiveYear: 'desc' }
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Rules update error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
