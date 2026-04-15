import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const kudos = await prisma.kudos.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(kudos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch kudos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromExec, toExec, toName, message, category } = body;
    
    const kudos = await prisma.kudos.create({
      data: {
        fromExec,
        toExec: toExec || null,
        toName: toName || null,
        message,
        category,
      },
    });
    
    return NextResponse.json(kudos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create kudos' }, { status: 500 });
  }
}