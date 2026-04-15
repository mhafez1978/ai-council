import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const status = await prisma.hourlyStatus.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { hour: 'desc' },
    });
    
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hour, task, status, notes } = body;
    
    const entry = await prisma.hourlyStatus.create({
      data: { hour, task, status, notes },
    });
    
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log status' }, { status: 500 });
  }
}