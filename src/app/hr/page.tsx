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

interface HourlyStatus {
  id: string;
  hour: number;
  task: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { id: 'working', label: '💼 Working', color: 'default' },
  { id: 'break', label: '☕ Break', color: 'secondary' },
  { id: 'meeting', label: '👥 Meeting', color: 'outline' },
  { id: 'idle', label: '💤 Idle', color: 'destructive' },
];

const BUSINESS_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export default function HRPage() {
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ hour: 0, task: '', status: 'working', notes: '' });
  const [todayLogs, setTodayLogs] = useState<HourlyStatus[]>([]);
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    setCurrentHour(new Date().getHours());
    fetchLogs();
    
    const checkInterval = setInterval(() => {
      const h = new Date().getHours();
      setCurrentHour(h);
      if (h > 8 && h <= 17 && h % 1 === 0) {
        setShowLog(true);
      }
    }, 60000);
    
    return () => clearInterval(checkInterval);
  }, []);

  const fetchLogs = async () => {
    const res = await fetch('/api/hr');
    setTodayLogs(await res.json());
  };

  const handleLog = async () => {
    const hourVal = new Date().getHours();
    await fetch('/api/hr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hour: hourVal, task: form.task, status: form.status, notes: form.notes }),
    });
    setShowLog(false);
    setForm({ hour: hourVal, task: '', status: 'working', notes: '' });
    fetchLogs();
  };

  const isLogged = (h: number) => todayLogs.some(log => log.hour === h);
  const getLog = (h: number) => todayLogs.find(log => log.hour === h);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm">← Back</Link>
          <h1 className="text-3xl font-bold mt-2">👥 HR Department</h1>
          <p className="text-muted-foreground">Hourly status & employee management</p>
        </div>
        <Button onClick={() => setShowLog(!showLog)}>
          📝 Log Hour {currentHour}:00
        </Button>
      </div>

      {showLog && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Hourly Status Check-in</CardTitle>
            <CardDescription>What are you working on at {currentHour}:00?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
<Select value={form.status} onValueChange={v => setForm({ ...form, status: v || 'working' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Task</Label>
              <Textarea
                value={form.task}
                onChange={e => setForm({ ...form, task: e.target.value })}
                placeholder="What are you working on right now?"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any blockers, issues, or notes"
              />
            </div>
            <Button onClick={handleLog} className="w-full">
              ✅ Submit Status
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>🕐 Today's Hourly Tracker</CardTitle>
          <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {BUSINESS_HOURS.map(hour => {
              const log = getLog(hour);
              const isCurrentHour = hour === currentHour;
              return (
                <div
                  key={hour}
                  className={`p-3 rounded-lg text-center ${
                    isLogged(hour) 
                      ? 'bg-primary text-primary-foreground' 
                      : isCurrentHour 
                        ? 'border-2 border-primary bg-primary/10'
                        : 'bg-muted'
                  }`}
                >
                  <p className="font-bold text-lg">{hour}:00</p>
                  {log ? (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {log.status === 'working' ? '💼' : log.status === 'break' ? '☕' : log.status === 'meeting' ? '👥' : '💤'}
                      </Badge>
                      <p className="text-xs mt-1 truncate">{log.task?.slice(0, 20)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      {isCurrentHour ? '→ Log now' : '-'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📜 Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {todayLogs.length === 0 ? (
            <p className="text-muted-foreground">No logs yet today</p>
          ) : (
            <div className="space-y-3">
              {todayLogs.map(log => (
                <div key={log.id} className="p-3 rounded-lg bg-accent">
                  <div className="flex items-center justify-between">
                    <Badge>{log.hour}:00</Badge>
                    <Badge variant={log.status === 'working' ? 'default' : 'secondary'}>
                      {log.status}
                    </Badge>
                  </div>
                  <p className="mt-2">{log.task}</p>
                  {log.notes && (
                    <p className="text-xs text-muted-foreground mt-1">📝 {log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}