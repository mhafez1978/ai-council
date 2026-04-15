import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const executives = await prisma.executiveAgent.findMany({
      where: { isActive: true },
      include: {
        schedules: { where: { isActive: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    return NextResponse.json(executives);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch executives' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, email, phone } = body;
    
    const executive = await prisma.executiveAgent.create({
      data: { name, role, email, phone },
    });
    
    return NextResponse.json(executive);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create executive' }, { status: 500 });
  }
}