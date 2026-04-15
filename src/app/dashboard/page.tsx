'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Decision {
  id: string;
  objective: string;
  mode: string;
  riskTolerance: string;
  budget: string;
  timeline: string;
  decision: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/decisions')
      .then((res) => res.json())
      .then((data) => {
        setDecisions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getDecisionVariant = (decision: string) => {
    const d = decision?.toLowerCase() || '';
    if (d.includes('approve')) return 'default';
    if (d.includes('reject')) return 'destructive';
    if (d.includes('modify')) return 'secondary';
    return 'outline';
  };

  const getModeVariant = (mode: string) => {
    const m = mode?.toUpperCase() || '';
    if (m === 'SURVIVAL') return 'destructive';
    if (m === 'GROWTH') return 'default';
    if (m === 'OPTIMIZATION') return 'secondary';
    return 'outline';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1">AI-powered decision history</p>
        </div>
        <Link href="/new">
          <Button>+ New Decision</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {decisions.filter(d => d.decision?.toLowerCase().includes('approve')).length}
            </div>
            <p className="text-xs text-muted-foreground">Approved decisions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {decisions.filter(d => !d.decision || d.decision === 'Unknown').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
      </div>

      {decisions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground text-lg">No decisions yet</p>
            <p className="text-muted-foreground mt-2">Submit your first decision request to get started</p>
            <Link href="/new" className="mt-4">
              <Button variant="outline">Create your first decision</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
            <CardDescription>Your decision history</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {decisions.map((decision) => (
                  <Link
                    key={decision.id}
                    href={`/decision/${decision.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{decision.objective}</p>
                      <p className="text-sm text-muted-foreground">
                        {decision.budget} • {decision.timeline}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getModeVariant(decision.mode)}>{decision.mode}</Badge>
                      <Badge variant={getDecisionVariant(decision.decision || '')}>
                        {decision.decision || 'Unknown'}
                      </Badge>
                      <p className="text-xs text-muted-foreground w-20 text-right">
                        {formatDate(decision.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}