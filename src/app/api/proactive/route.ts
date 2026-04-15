import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const schedules = await prisma.proactiveSchedule.findMany({
      where: { isActive: true },
      include: { executive: true },
      orderBy: { nextRun: 'asc' },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { executiveId, actionType, schedule, config } = body;
    
    const nextRun = calculateNextRun(schedule);
    
    const proactive = await prisma.proactiveSchedule.create({
      data: {
        executiveId,
        actionType,
        schedule,
        config: JSON.stringify(config),
        nextRun,
      },
    });
    
    return NextResponse.json(proactive);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}

function calculateNextRun(cron: string): Date {
  const now = new Date();
  if (cron === 'daily_morning') {
    const next = new Date(now);
    next.setHours(8, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }
  if (cron === 'hourly') {
    const next = new Date(now);
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  }
  return now;
}