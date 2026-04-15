'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Kudos {
  id: string;
  fromExec: string;
  toExec: string | null;
  toName: string | null;
  message: string;
  category: string;
  createdAt: string;
}

const EXECUTIVES = [
  { id: 'CFO', name: 'CFO', icon: '💰' },
  { id: 'CTO', name: 'CTO', icon: '🔧' },
  { id: 'CMO', name: 'CMO', icon: '📢' },
  { id: 'COO', name: 'COO', icon: '⚙️' },
  { id: 'CLO', name: 'CLO', icon: '⚖️' },
  { id: 'INNOVATION', name: 'Innovation', icon: '💡' },
];

const CATEGORIES = [
  { id: 'teamwork', label: '🤝 Teamwork' },
  { id: 'innovation', label: '💡 Innovation' },
  { id: 'leadership', label: '👔 Leadership' },
  { id: 'results', label: '🎯 Results' },
  { id: 'help', label: '🙌 Help' },
  { id: 'accomplishment', label: '🏆 Accomplishment' },
];

export default function ScoreboardPage() {
  const [kudos, setKudos] = useState<Kudos[]>([]);
  const [showGive, setShowGive] = useState(false);
  const [form, setForm] = useState({ fromExec: '', toExec: '', toName: '', message: '', category: '' });
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; score: number }[]>([]);

  useEffect(() => {
    fetch('/api/kudos')
      .then(res => res.json())
      .then(data => setKudos(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const scores: Record<string, number> = {};
    kudos.forEach(k => {
      if (k.toExec) {
        scores[k.toExec] = (scores[k.toExec] || 0) + 1;
      } else if (k.toName) {
        scores[k.toName] = (scores[k.toName] || 0) + 1;
      }
    });
    const board = Object.entries(scores)
      .map(([id, score]) => ({ id, name: EXECUTIVES.find(e => e.id === id)?.name || id, score }))
      .sort((a, b) => b.score - a.score);
    setLeaderboard(board);
  }, [kudos]);

  const handleGive = async () => {
    if (!form.message || (!form.toExec && !form.toName)) return;
    
    await fetch('/api/kudos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    setForm({ fromExec: '', toExec: '', toName: '', message: '', category: '' });
    setShowGive(false);
    
    const res = await fetch('/api/kudos');
    setKudos(await res.json());
  };

  const getCategoryBadge = (cat: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      accomplishment: 'default',
      innovation: 'secondary',
      results: 'destructive',
      teamwork: 'outline',
      help: 'outline',
      leadership: 'secondary',
    };
    return variants[cat] || 'outline';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm">← Back</Link>
          <h1 className="text-3xl font-bold mt-2">🏆 Company Scoreboard</h1>
          <p className="text-muted-foreground">Recognize accomplishments & give kudos</p>
        </div>
        <Button onClick={() => setShowGive(!showGive)}>
          {showGive ? 'Cancel' : '🎁 Give Kudos'}
        </Button>
      </div>

      {showGive && (
        <Card>
          <CardHeader>
            <CardTitle>Give Recognition</CardTitle>
            <CardDescription>Recognize a team member's great work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From (Your Executive)</Label>
                <Select value={form.fromExec} onValueChange={v => setForm({ ...form, fromExec: v || '' })}>
                  <SelectTrigger><SelectValue placeholder="Select yourself" /></SelectTrigger>
                  <SelectContent>
                    {EXECUTIVES.map(e => (<SelectItem key={e.id} value={e.id}>{e.icon} {e.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={form.toExec} onValueChange={v => setForm({ ...form, toExec: v || '', toName: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ME">👤 Me (Owner)</SelectItem>
                    {EXECUTIVES.map(e => (<SelectItem key={e.id} value={e.id}>{e.icon} {e.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v || '' })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (<SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Great job on... / Thanks for... / Amazing work..."
              />
            </div>
            <Button onClick={handleGive} disabled={!form.message || (!form.toExec && !form.toName)} className="w-full">
              🎉 Send Kudos
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🏅 Leaderboard</CardTitle>
            <CardDescription>Most recognized this week</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-muted-foreground">No kudos yet</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                      <span>{EXECUTIVES.find(e => e.id === item.id)?.icon || '👤'}</span>
                      <span className="font-medium">{item.name === 'ME' ? 'Owner' : item.name}</span>
                    </div>
                    <Badge variant="default">{item.score} pts</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📜 Hall of Fame</CardTitle>
            <CardDescription>Recent recognition</CardDescription>
          </CardHeader>
          <CardContent>
            {kudos.length === 0 ? (
              <p className="text-muted-foreground">No kudos yet - be the first!</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-auto">
                {kudos.slice(0, 10).map(k => (
                  <div key={k.id} className="p-3 rounded-lg bg-accent">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {EXECUTIVES.find(e => e.id === k.fromExec)?.icon || '🤖'} → {' '}
                          {k.toExec ? EXECUTIVES.find(e => e.id === k.toExec)?.icon : k.toName ? '👤' : ''}
                        </span>
                        <span className="text-sm">
                          {k.toExec ? k.toExec : k.toName || 'Owner'}
                        </span>
                      </div>
                      <Badge variant={getCategoryBadge(k.category)}>{k.category}</Badge>
                    </div>
                    <p className="text-sm">{k.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}