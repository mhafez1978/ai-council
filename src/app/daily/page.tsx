'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
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
  feedback?: string | null;
}

function PlayButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const speak = () => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onend = () => setPlaying(false);
    window.speechSynthesis.speak(u);
    setPlaying(true);
  };
  return <button onClick={speak} className="ml-2 text-gray-400 hover:text-blue-600 text-sm">{playing ? '⏹️' : '🔊'}</button>;
}

export default function DailyNotesPage() {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ task: '', hours: '', result: '' });
  const [totalHours, setTotalHours] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [context, setContext] = useState('');

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/dailynotes');
      const data = await res.json();
      if (!Array.isArray(data)) { setNotes([]); return; }
      setNotes(data);
      
      const contextText = data.slice(0, 7).map(n => 
        `- ${n.date?.split('T')[0]}: ${n.task} (${n.hours}h) - ${n.result || 'Done'} ${n.feedback ? '[FB: ' + n.feedback + ']' : ''}`
      ).join('\n');
      setContext(contextText);
      
      const hours = data.reduce((sum: number, n: DailyNote) => sum + (n.hours || 0), 0);
      const scores = data.filter((n: DailyNote) => n.score).map((n: DailyNote) => n.score || 0);
      const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
      setTotalHours(hours);
      setAvgScore(avg);
    } catch (e) { setNotes([]); }
  };

  const handleSubmit = async () => {
    if (!form.task) return;
    if (editId) {
      await fetch('/api/dailynotes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...form, hours: parseFloat(form.hours) || 0 }) });
      toast.success('Activity updated');
    } else {
      await fetch('/api/dailynotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, hours: parseFloat(form.hours) || 0 }) });
      toast.success('Activity added');
    }
    setShowAdd(false); setEditId(null); setForm({ task: '', hours: '', result: '' }); fetchNotes();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/dailynotes?id=${id}`, { method: 'DELETE' });
    toast.success('Activity deleted');
    fetchNotes();
  };

  const handleEdit = (note: DailyNote) => {
    setForm({ task: note.task, hours: String(note.hours || ''), result: note.result || '' });
    setEditId(note.id); setShowAdd(true);
  };

  // Get AI feedback on specific activity - shows in board meetings and affects score
  const getActivityFeedback = async (noteId: string, task: string, result: string, hasFeedback: boolean) => {
    if (hasFeedback) { toast.info('Feedback already exists'); return; }
    
    toast.promise(
      (async () => {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: `You are the CEO for Blooming Brands & Nodes. Evaluate this activity and give a score 0-10 based on quality, impact, and results. Reply in format: SCORE:X Feedback:...`,
            user: `Evaluate: "${task}" - ${result || 'Completed'}`,
          }),
        });
        const data = await res.json();
        const response = data.response;
        
        const scoreMatch = response.match(/SCORE:(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
        const feedback = response.replace(/SCORE:\d+\s*/i, '').replace(/Feedback:/i, 'Feedback:');
        
        await fetch('/api/dailynotes', { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id: noteId, feedback, score }) 
        });
        fetchNotes();
        return `Score: ${score}/10 - Feedback saved!`;
      })(),
      { loading: '🤖 Executive evaluating...', success: (msg) => msg, error: 'Failed to score' }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm">← Back</Link>
          <h1 className="text-3xl font-bold mt-2">📝 Daily Activities</h1>
          <p className="text-muted-foreground">Executives see these in board meetings</p>
        </div>
        <Button onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ task: '', hours: '', result: '' }); }}>
          {showAdd ? 'Cancel' : '+ Add Activity'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Hours</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalHours.toFixed(1)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tasks</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{notes.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Score</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{avgScore.toFixed(1)}/10</div></CardContent></Card>
      </div>

      <Card className="border-purple-500 bg-purple-50">
        <CardHeader>
          <CardTitle>📋 Executive Context</CardTitle>
          <CardDescription>Paste this in board meetings for instant context</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={context} readOnly rows={5} className="bg-white" />
          <Button variant="outline" className="mt-2 w-full" onClick={() => { navigator.clipboard.writeText(context); toast.success('Copied to clipboard!'); }}>
            📋 Copy for Meeting
          </Button>
        </CardContent>
      </Card>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle>{editId ? 'Edit' : 'Add'} Activity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} placeholder="What did you work on?" />
            <Input type="number" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="Hours" />
            <Textarea value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} placeholder="Result / blockers?" />
            <Button onClick={handleSubmit} className="w-full">{editId ? 'Update' : 'Save'}</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Activity History</CardTitle></CardHeader>
        <CardContent>
          {notes.length === 0 ? <p className="text-muted-foreground">No activities</p> : (
            <div className="space-y-4">
              {notes.map(note => (
                <div key={note.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{note.hours || 0}h</Badge>
                      <span className="text-xs text-muted-foreground">{note.date?.split('T')[0]}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => getActivityFeedback(note.id, note.task, note.result || '', !!note.feedback)} className="text-purple-600 text-sm">{note.feedback ? '📝 View Feedback' : '🤖 Get Feedback'}</button>
                      <button onClick={() => handleEdit(note)} className="text-blue-600">✏️</button>
                      <button onClick={() => handleDelete(note.id)} className="text-red-600">🗑️</button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div><p className="font-medium">{note.task}</p>
                    {note.result && <p className="text-sm text-muted-foreground">→ {note.result}</p>}
                    {note.feedback && <div className="mt-2 p-2 bg-purple-100 rounded text-sm">💬 Exec: {note.feedback}</div>}
                    </div>
                    <PlayButton text={`${note.task}. ${note.result || ''}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}