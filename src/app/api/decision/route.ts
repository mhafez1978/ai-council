import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPrompt, callAI, parseDecisionJson } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objective, budget, timeline, riskTolerance, context, mode } = body;

    if (!objective || !budget || !timeline || !riskTolerance || !context || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { system, user } = buildPrompt({
      objective,
      budget,
      timeline,
      riskTolerance,
      context,
      mode,
    });

    const aiResponse = await callAI(system, user);
    const decisionJson = parseDecisionJson(aiResponse);

    const decision = await prisma.decision.create({
      data: {
        objective,
        budget,
        timeline,
        riskTolerance,
        mode,
        context,
        fullResponse: aiResponse,
        decisionJson: decisionJson ? JSON.stringify(decisionJson) : '{}',
      },
    });

    return NextResponse.json({
      id: decision.id,
      objective: decision.objective,
      mode: decision.mode,
      decision: decisionJson?.decision || 'Unknown',
    });
  } catch (error) {
    console.error('Error creating decision:', error);
    return NextResponse.json(
      { error: 'Failed to create decision' },
      { status: 500 }
    );
  }
}