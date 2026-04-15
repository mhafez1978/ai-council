import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { execId, topic, messages } = body;

    if (!execId || !topic || !messages) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        execId,
        topic,
        messages: JSON.stringify(messages),
      },
    });

    return NextResponse.json({ id: discussion.id });
  } catch (error) {
    console.error('Error saving discussion:', error);
    return NextResponse.json({ error: 'Failed to save discussion' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const discussions = await prisma.discussion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const formatted = discussions.map((d) => ({
      id: d.id,
      execId: d.execId,
      topic: d.topic,
      messageCount: JSON.parse(d.messages).length,
      createdAt: d.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}