'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function NewDecisionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    objective: '',
    budget: '',
    timeline: '',
    riskTolerance: 'medium',
    context: '',
    mode: 'SURVIVAL',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create decision');

      const data = await res.json();
      router.push(`/decision/${data.id}`);
    } catch (err) {
      setError('Failed to submit decision. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">New Decision Request</h1>
        <p className="text-muted-foreground mt-2">
          Submit a business decision for the AI Executive Council to analyze
        </p>
      </div>

      {error && (
        <Card className="border-destructive mb-6">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Decision Details</CardTitle>
          <CardDescription>Provide context about your decision request</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="objective">Objective *</Label>
              <Input
                id="objective"
                required
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="What decision needs to be made?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget *</Label>
                <Input
                  id="budget"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g., $5,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline *</Label>
                <Input
                  id="timeline"
                  required
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g., 30 days"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Operating Mode *</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value) => setFormData({ ...formData, mode: value as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SURVIVAL">SURVIVAL</SelectItem>
                    <SelectItem value="GROWTH">GROWTH</SelectItem>
                    <SelectItem value="OPTIMIZATION">OPTIMIZATION</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Risk Tolerance *</Label>
                <Select
                  value={formData.riskTolerance}
                  onValueChange={(value) => setFormData({ ...formData, riskTolerance: value as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Context *</Label>
              <Textarea
                id="context"
                required
                rows={6}
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="Provide detailed context for this decision..."
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Submit to Executive Council'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}