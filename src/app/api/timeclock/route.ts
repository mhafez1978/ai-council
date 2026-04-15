import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const clockedIn = await prisma.timeClock.findFirst({
      where: { checkIn: { gte: today } },
      orderBy: { checkIn: 'desc' },
    });
    
    const history = await prisma.timeClock.findMany({
      where: { checkIn: { gte: today } },
      orderBy: { checkIn: 'desc' },
      take: 10,
    });
    
    return NextResponse.json({ current: clockedIn, history });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch timeclock' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'clock_in') {
      const clock = await prisma.timeClock.create({
        data: { status: 'clocked_in', checkIn: new Date() },
      });
      return NextResponse.json(clock);
    }
    
    if (action === 'clock_out') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const current = await prisma.timeClock.findFirst({
        where: { checkIn: { gte: today }, status: 'clocked_in' },
      });
      
      if (current) {
        const checkOut = new Date();
        const hours = (checkOut.getTime() - current.checkIn.getTime()) / (1000 * 60 * 60);
        
        const clock = await prisma.timeClock.update({
          where: { id: current.id },
          data: { status: 'clocked_out', checkOut, totalHours: hours },
        });
        return NextResponse.json(clock);
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update timeclock' }, { status: 500 });
  }
}