import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const decision = await prisma.decision.findUnique({
      where: { id },
    });

    if (!decision) {
      return NextResponse.json(
        { error: 'Decision not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: decision.id,
      objective: decision.objective,
      budget: decision.budget,
      timeline: decision.timeline,
      riskTolerance: decision.riskTolerance,
      mode: decision.mode,
      context: decision.context,
      fullResponse: decision.fullResponse,
      decisionJson: decision.decisionJson,
      createdAt: decision.createdAt,
    });
  } catch (error) {
    console.error('Error fetching decision:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decision' },
      { status: 500 }
    );
  }
}