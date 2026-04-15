import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const decisions = await prisma.decision.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        objective: true,
        mode: true,
        riskTolerance: true,
        budget: true,
        timeline: true,
        decisionJson: true,
        createdAt: true,
      },
    });

    const formatted = decisions.map((d: { id: string; objective: string; mode: string; riskTolerance: string; budget: string; timeline: string; decisionJson: string; createdAt: Date }) => {
      let parsed: { decision?: string } = {};
      try {
        parsed = JSON.parse(d.decisionJson);
      } catch {}
      return {
        id: d.id,
        objective: d.objective,
        mode: d.mode,
        riskTolerance: d.riskTolerance,
        budget: d.budget,
        timeline: d.timeline,
        decision: parsed.decision || 'Unknown',
        createdAt: d.createdAt,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decisions' },
      { status: 500 }
    );
  }
}