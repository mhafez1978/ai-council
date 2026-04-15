'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface DailyNote {
  id: string;
  date: string;
  task: string;
  hours: number | null;
  result: string | null;
  score: number | null;
}

export default function DailyNotesPage() {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ task: '', hours: '', result: '' });
  const [totalHours, setTotalHours] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch('/api/dailynotes');
    const data = await res.json();
    setNotes(data);
    
    const hours = data.reduce((sum: number, n: DailyNote) => sum + (n.hours || 0), 0);
    const scores = data.filter((n: DailyNote) => n.score).map((n: DailyNote) => n.score);
    const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
    
    setTotalHours(hours);
    setAvgScore(avg);
  };

  const handleSubmit = async () => {
    await fetch('/api/dailynotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: form.task,
        hours: parseFloat(form.hours) || 0,
        result: form.result,
      }),
    });
    setShowAdd(false);
    setForm({ task: '', hours: '', result: '' });
    fetchNotes();
  };

  const askAIFeedback = async () => {
    const prompt = `You are the AI Executive Board. Review this daily activity log and provide feedback, comments, and suggestions for improvement:

${notes.slice(0, 5).map(n => `- ${n.task}: ${n.result || 'In progress'}`).join('\n')}

Provide a brief assessment and any recommendations.`;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        system: prompt, 
        user: 'Please review my daily activities and provide feedback' 
      }),
    });
    const data = await res.json();
    alert(data.response);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm">← Back</Link>
          <h1 className="text-3xl font-bold mt-2">📝 Daily Activities</h1>
          <p className="text-muted-foreground">Track what you accomplish each day</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={askAIFeedback}>🤖 Get AI Feedback</Button>
          <Button onClick={() => setShowAdd(!showAdd)}>+ Add Activity</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Hours</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalHours.toFixed(1)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tasks Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{notes.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Avg Score</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{avgScore.toFixed(1)}/10</div></CardContent>
        </Card>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>Add Today's Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={form.task}
              onChange={e => setForm({ ...form, task: e.target.value })}
              placeholder="What did you work on today?"
            />
            <Input
              type="number"
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
              placeholder="Hours spent"
            />
            <Textarea
              value={form.result}
              onChange={e => setForm({ ...form, result: e.target.value })}
              placeholder="What was the result?"
            />
            <Button onClick={handleSubmit} className="w-full">Save Activity</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-muted-foreground">No activities logged yet</p>
          ) : (
            <div className="space-y-4">
              {notes.map(note => (
                <div key={note.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Badge variant={note.score && note.score >= 7 ? 'default' : note.score ? 'secondary' : 'outline'}>
                        {note.score ? `${note.score}/10` : 'Unscored'}
                      </Badge>
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline">{note.hours || 0} hrs</Badge>
                  </div>
                  <p className="font-medium">{note.task}</p>
                  {note.result && <p className="text-sm text-muted-foreground mt-1">→ {note.result}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}