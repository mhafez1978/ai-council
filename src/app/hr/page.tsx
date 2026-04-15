'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
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

export default function HRPage() {
  const [clockedIn, setClockedIn] = useState(false);
  const [todayHours, setTodayHours] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [currentSession, setCurrentSession] = useState<TimeEntry | null>(null);

  useEffect(() => {
    fetchClock();
    const interval = setInterval(fetchClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchClock = async () => {
    const res = await fetch('/api/timeclock');
    const data = await res.json();
    const current = data.current;
    setCurrentSession(current);
    setClockedIn(current?.status === 'clocked_in');
    
    if (current?.status === 'clocked_in') {
      const hours = (new Date().getTime() - new Date(current.checkIn).getTime()) / (1000 * 60 * 60);
      setElapsed(hours);
    } else {
      setElapsed(0);
    }
    
    const total = data.history?.reduce((sum: number, t: TimeEntry) => sum + (t.totalHours || 0), 0) || 0;
    if (current?.status === 'clocked_in') {
      const currentHours = (new Date().getTime() - new Date(current.checkIn).getTime()) / (1000 * 60 * 60);
      setTodayHours(total + currentHours);
    } else {
      setTodayHours(total);
    }
  };

  const clockIn = async () => {
    await fetch('/api/timeclock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clock_in' }),
    });
    toast.success('Clocked in!');
    fetchClock();
  };

  const clockOut = async () => {
    await fetch('/api/timeclock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clock_out' }),
    });
    toast.success('Clocked out!');
    fetchClock();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm">← Back</Link>
        <h1 className="text-3xl font-bold mt-2">👥 HR & Attendance</h1>
        <p className="text-muted-foreground">Time tracking - unified with clock in/out</p>
      </div>

      <Card className={clockedIn ? 'border-green-500 bg-green-50' : 'border-gray-200'}>
        <CardHeader className="text-center">
          <Badge variant={clockedIn ? 'default' : 'secondary'} className="w-fit mx-auto">
            {clockedIn ? '🟢 Clocked In' : '⚪ Not Working'}
          </Badge>
          <CardTitle className="text-4xl font-bold mt-4">
            {clockedIn 
              ? `${Math.floor(elapsed)}:${String(Math.floor((elapsed % 1) * 60)).padStart(2, '0')}`
              : '0:00'
            }
          </CardTitle>
          <CardDescription>Today's work time</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          {clockedIn ? (
            <Button onClick={clockOut} variant="destructive" size="lg">🛑 Clock Out</Button>
          ) : (
            <Button onClick={clockIn} size="lg">▶️ Clock In</Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Today Hours</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayHours.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Current</CardTitle></CardHeader>
          <CardContent>
            {currentSession ? (
              <div>
                <p className="text-sm">Started: {new Date(currentSession.checkIn).toLocaleTimeString()}</p>
                {currentSession.checkOut && (
                  <p className="text-sm">Ended: {new Date(currentSession.checkOut).toLocaleTimeString()}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Not clocked in today</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>💡 How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Clock In/Out</strong> - tracks your work day (same as Time Clock page)</p>
          <p>• <strong>HR Dashboard</strong> shows your attendance and hours</p>
          <p>• Both pages share the same data - no duplicate entry needed</p>
          <p>• Use either /clock or /hr to clock in/out</p>
        </CardContent>
      </Card>
    </div>
  );
}