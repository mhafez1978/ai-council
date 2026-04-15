'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimeEntry {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string | null;
  totalHours: number | null;
}

export default function ClockPage() {
  const [current, setCurrent] = useState<TimeEntry | null>(null);
  const [history, setHistory] = useState<TimeEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (current?.status === 'clocked_in') {
      const update = () => {
        setElapsed((new Date().getTime() - new Date(current.checkIn).getTime()) / (1000 * 60 * 60));
      };
      update();
      const interval = setInterval(update, 60000);
      return () => clearInterval(interval);
    }
  }, [current]);

  const fetchData = async () => {
    const res = await fetch('/api/timeclock');
    const data = await res.json();
    setCurrent(data.current);
    setHistory(data.history || []);
  };

  const clockIn = async () => {
    await fetch('/api/timeclock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clock_in' }),
    });
    fetchData();
  };

  const clockOut = async () => {
    await fetch('/api/timeclock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clock_out' }),
    });
    fetchData();
  };

  const isWorking = current?.status === 'clocked_in';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm">← Back</Link>
          <h1 className="text-3xl font-bold mt-2">⏰ Time Clock</h1>
          <p className="text-muted-foreground">Track your work hours</p>
        </div>
      </div>

      <Card className={isWorking ? 'border-green-500 bg-green-50' : ''}>
        <CardHeader className="text-center">
          <Badge variant={isWorking ? 'default' : 'secondary'} className="w-fit mx-auto">
            {isWorking ? '🟢 Working' : '⚪ Not Working'}
          </Badge>
          <CardTitle className="text-5xl font-bold mt-4">
            {isWorking 
              ? `${Math.floor(elapsed)}:${String(Math.floor((elapsed % 1) * 60)).padStart(2, '0')}`
              : '0:00'
            }
          </CardTitle>
          <CardDescription>{isWorking ? 'Hours worked today' : 'Clock in to start tracking'}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isWorking ? (
            <Button onClick={clockOut} variant="destructive" size="lg" className="w-48">
              🛑 Clock Out
            </Button>
          ) : (
            <Button onClick={clockIn} size="lg" className="w-48">
              ▶️ Clock In
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.filter(h => h.status === 'clocked_out').length === 0 ? (
            <p className="text-muted-foreground">No completed sessions today</p>
          ) : (
            <div className="space-y-3">
              {history.filter(h => h.status === 'clocked_out').map(entry => (
                <div key={entry.id} className="flex justify-between items-center p-3 rounded-lg bg-accent">
                  <div>
                    <p className="font-medium">
                      {new Date(entry.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {entry.checkOut ? new Date(entry.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {entry.totalHours?.toFixed(2)} hrs
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}