import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FileType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const athleteId = parseInt(formData.get('athleteId') as string);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (!file || !athleteId || isNaN(athleteId)) {
      return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Convert FileType enum values to uppercase to match Prisma enum
    const fileTypeMapping: Record<string, FileType> = {
      'application/pdf': 'PDF',
      'image/jpeg': 'JPEG', 
      'image/png': 'PNG'
    };

    if (!(file.type in fileTypeMapping)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const uploadedFile = await prisma.swimmingProof.create({
      data: {
        fileUrl: `/uploads/${Date.now()}_${file.name}`,
        fileType: fileTypeMapping[file.type],
        uploadDate: new Date(),
        athlete: { connect: { id: athleteId } }
      }
    });

    return NextResponse.json(uploadedFile);
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
